// Sends transactional e-mail through Brevo's HTTP API (free: 300 mails/day,
// no domain needed - verify one "sender" address in Brevo). No npm package.
//   BREVO_API_KEY      API key (Brevo > SMTP & API > API keys)
//   MAIL_FROM_EMAIL    the verified sender address
//   MAIL_FROM_NAME     optional display name
// Without a key: in development the mail is printed to the server log;
// in production it fails so nobody thinks a code was sent.
export function mailConfigured() {
  return Boolean((process.env.BREVO_API_KEY || '').trim() && (process.env.MAIL_FROM_EMAIL || '').trim());
}

export async function sendMail({ to, subject, text, html }) {
  if (!mailConfigured()) {
    const isProd = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
    if (isProd) {
      const err = new Error('mail not configured');
      err.status = 503;
      err.publicMessage = 'ईमेल सेवा अभी चालू नहीं है। कृपया बाद में प्रयास करें।';
      throw err;
    }
    console.log(`[dev mail] to=${to} subject=${subject}\n${text}`);
    return;
  }
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY.trim(), 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { email: process.env.MAIL_FROM_EMAIL.trim(), name: (process.env.MAIL_FROM_NAME || 'बेलानगर सरस्वती पूजा समिति').trim() },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('[mail] Brevo error', res.status, body.slice(0, 300));
    const err = new Error('mail send failed');
    err.status = 502;
    err.publicMessage = 'ईमेल भेजा नहीं जा सका। कृपया कुछ देर बाद प्रयास करें।';
    throw err;
  }
}
