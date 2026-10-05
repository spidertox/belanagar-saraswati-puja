// ─────────────────────────────────────────────────────────────────────────
// Telegram-backed "database".
//
// How it works (read this before touching anything below):
//   The Telegram Bot API has no query language and no "list all messages"
//   call, so a bot cannot browse a chat's history on its own. To make a
//   private Telegram group behave like a tiny document database, the whole
//   dataset is kept as ONE JSON file, attached to ONE message, which we PIN
//   so it can always be found again with a single getChat call — no message
//   IDs need to be remembered between requests.
//
//   - Bootstrap (first ever request): send a document containing an empty
//     database, then pin that message.
//   - Read: getChat -> pinned_message.document.file_id -> getFile ->
//     download the file from Telegram's file server -> JSON.parse.
//   - Write: download the current file, mutate the JS object, re-upload it
//     with editMessageMedia on the SAME message (so the pin never moves).
//
// Known limitations (documented here, and in the README):
//   - Reads and writes are "download whole file, mutate, re-upload whole
//     file" — there is no partial update. Two admins saving at almost the
//     exact same instant could overwrite one another (last write wins).
//     For a small committee saving sequentially this is very unlikely to
//     bite, but it is not a real transactional database.
//   - If someone manually unpins or deletes the storage message in
//     Telegram, the app will look empty and a fresh one will be created on
//     the next write. Don't unpin/delete it.
//   - Telegram documents are capped at ~50MB by the Bot API, which is far
//     more than a puja committee's records will ever reach.
// ─────────────────────────────────────────────────────────────────────────

const BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const CHAT_ID = (process.env.TELEGRAM_CHAT_ID || '').trim();
const SETUP_MESSAGE = 'सर्वर सही से सेटअप नहीं है। कृपया एडमिन से संपर्क करें।';

const API_BASE = () => `https://api.telegram.org/bot${BOT_TOKEN}`;
const FILE_BASE = (filePath) => `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

const EMPTY_DB = () => ({
  donations: [],
  expenses: [],
  events: [],
  gallery: [],
  announcements: [],
  auditLog: [],
  counters: {},
  updatedAt: null,
});

function assertConfigured() {
  if (!BOT_TOKEN || !CHAT_ID) {
    const err = new Error(
      'सर्वर सही से सेटअप नहीं है। कृपया एडमिन से संपर्क करें। (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID missing)'
    );
    err.status = 500;
    err.publicMessage = SETUP_MESSAGE;
    throw err;
  }
}

async function telegramCall(method, params) {
  assertConfigured();
  const res = await fetch(`${API_BASE()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => null);
  if (!data || !data.ok) {
    const err = new Error(
      `Telegram API error (${method}): ${(data && data.description) || res.status}`
    );
    err.status = 502;
    throw err;
  }
  return data.result;
}

async function telegramUpload(method, fields, fileFieldName, fileBuffer, fileName) {
  assertConfigured();
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) form.append(key, String(value));
  }
  form.append(fileFieldName, new Blob([fileBuffer], { type: 'application/json' }), fileName);

  const res = await fetch(`${API_BASE()}/${method}`, { method: 'POST', body: form });
  const data = await res.json().catch(() => null);
  if (!data || !data.ok) {
    const err = new Error(`Telegram API error (${method}): ${(data && data.description) || res.status}`);
    err.status = 502;
    throw err;
  }
  return data.result;
}

async function findStorageMessage() {
  const chat = await telegramCall('getChat', { chat_id: CHAT_ID });
  if (chat.pinned_message && chat.pinned_message.document) {
    return chat.pinned_message;
  }
  return null;
}

async function downloadJson(fileId) {
  const fileInfo = await telegramCall('getFile', { file_id: fileId });
  const res = await fetch(FILE_BASE(fileInfo.file_path));
  if (!res.ok) {
    const err = new Error('Telegram से डेटा फ़ाइल डाउनलोड नहीं हो सकी।');
    err.status = 502;
    throw err;
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    const err = new Error('संग्रहीत डेटा पढ़ा नहीं जा सका (invalid JSON in storage file).');
    err.status = 500;
    throw err;
  }
}

async function bootstrap() {
  const data = EMPTY_DB();
  const buffer = Buffer.from(JSON.stringify(data, null, 2));
  const message = await telegramUpload(
    'sendDocument',
    { chat_id: CHAT_ID, caption: 'Belanagar Saraswati Puja Samiti — Database. कृपया इस मैसेज को unpin या delete न करें।' },
    'document',
    buffer,
    'data.json'
  );
  await telegramCall('pinChatMessage', { chat_id: CHAT_ID, message_id: message.message_id, disable_notification: true });
  return { data, messageId: message.message_id };
}

/** Reads the whole database. Bootstraps an empty one on first-ever call. */
async function readDatabase() {
  const pinned = await findStorageMessage();
  if (!pinned) return bootstrap();
  const data = await downloadJson(pinned.document.file_id);
  // Defensive merge in case the stored file predates a field we added later.
  return { data: { ...EMPTY_DB(), ...data }, messageId: pinned.message_id };
}

async function writeDatabase(data, messageId) {
  const buffer = Buffer.from(JSON.stringify(data, null, 2));
  await telegramUpload(
    'editMessageMedia',
    { chat_id: CHAT_ID, message_id: messageId, media: JSON.stringify({ type: 'document', media: 'attach://data.json' }) },
    'data.json',
    buffer,
    'data.json'
  );
}

/** Read-only accessor for one collection (donations, expenses, ...). */
export async function getCollection(type) {
  const { data } = await readDatabase();
  return data[type] || [];
}

/** Read-only accessor for the whole database (used by the summary endpoint). */
export async function getFullDatabase() {
  const { data } = await readDatabase();
  return data;
}

/**
 * Runs `mutatorFn(data)` against a freshly-read copy of the whole database,
 * then writes the result back in a single Telegram update. `mutatorFn`
 * should mutate `data` in place (or return nothing) — whatever `data` looks
 * like after it returns is what gets saved.
 */
export async function transact(mutatorFn) {
  const { data, messageId } = await readDatabase();
  const result = mutatorFn(data);
  data.updatedAt = new Date().toISOString();
  await writeDatabase(data, messageId);
  return result;
}
