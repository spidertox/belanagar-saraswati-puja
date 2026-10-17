# बेलानगर सरस्वती पूजा समिति — Website

A mobile-first React site for the Belanagar Saraswati Puja Samiti: public
pages (programme, gallery, committee, contact) plus a fully transparent,
publicly-viewable donations/expenses ledger with an admin panel to manage
it all — with **no traditional database**. Data is stored as a JSON file
inside a private Telegram group, read and written through a small
serverless API so the Bot Token never reaches the browser.

## Before you start — please read this

This project was generated in a sandboxed environment with **no internet
access**, so `npm install` was never run and the Telegram integration was
never exercised against the real Telegram API. What *was* verified,
offline:

- Every `.js`/`.jsx` file passes a JSX/syntax check.
- Every relative import resolves to a real file, and every named import
  matches an actual export (no typos in either direction).
- The admin password hashing + session-cookie logic was run and confirmed
  to correctly accept the right password, reject the wrong one, and
  reject a tampered cookie.
- The full create/read/update/delete flow for a resource (including the
  "hide the real name for an anonymous donation, but show it to the
  logged-in admin" logic and the totals/search/pagination math) was run
  end-to-end against an in-memory stand-in for the Telegram store, using
  the real `resourceHandler.js`.
- The lotus + veena background artwork was rendered in a headless browser
  and checked at phone and desktop widths (using hand-written CSS that
  mirrors the Tailwind classes, since Tailwind itself couldn't be installed
  offline). The real Tailwind/Vite build is still something to confirm on
  your machine with `npm run dev`.

What was **not**, and can't be, verified without a live deploy: the actual
HTTP calls to `api.telegram.org` in `server/telegramStore.js`
(`sendDocument` / `editMessageMedia` / `getFile` / `pinChatMessage`). These
are written carefully against the documented Telegram Bot API, but please
test the flow below on a throwaway Telegram group before trusting it with
real donation records, and see "If something doesn't work" at the bottom.

Also unverified here: how Vercel applies the `vercel.json` rewrites to the single API
function. If `/api/summary` shows a 404 after deploying, check that `vercel.json` is in
the repository root and that `api/` contains only `router.js`.

## Quick start (no Telegram needed yet)

```bash
npm install
npm run dev:mock     # terminal 1 — a local mock API with demo data
npm run dev          # terminal 2 — the site, at http://localhost:5173
```

The mock API (`dev-server/mock-api.js`) stores data in a local
`dev-server/db.json` file instead of Telegram, seeded from
`dev-server/seed-data.json`. It exists purely so you can click around the
whole site — including the admin panel — before setting up a real bot.
**Admin login in this mode only: password `admin123`.** None of this is
used in production.

## Setting up the real thing

### 1. Create a Telegram bot and storage group

1. Message **[@BotFather](https://t.me/BotFather)** on Telegram, send
   `/newbot`, and follow the prompts. Copy the token it gives you
   (`TELEGRAM_BOT_TOKEN`).
2. Create a new **private Telegram group** (not a channel — a group is
   simpler for a bot to fully operate in). Add your bot to it.
3. Open the group's member list, tap your bot, and make it an **admin**
   with at least "Pin Messages" permission.
4. Send any message in the group, then visit
   `https://api.telegram.org/bot<your-token>/getUpdates` in a browser.
   Find `"chat":{"id": ...}` in the response — that number (often
   negative, like `-1001234567890`) is your `TELEGRAM_CHAT_ID`.

The very first time any API request runs, the app will automatically send
a "database" document into that group and pin it — there's no manual
init step. **Don't unpin or delete that pinned message** — it's the
entire database. If it's ever removed, the app will transparently create
a fresh, empty one on the next write, and old data will be unreachable
(so if that ever happens, check the group's message history — the old
file is still sitting there as a regular Telegram message, just no
longer pinned).

### 2. Set up admin login

```bash
npm run generate-admin-hash
```

This prompts for a password and prints an `ADMIN_PASSWORD_HASH` value
(scrypt, salted — the plain password is never stored anywhere). There is
one shared admin account, by design, for a small committee — see
"Design choices" below if you need more than that.

Generate a random session-signing secret too:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Environment variables

Copy `.env.example` to `.env` for local testing against the real Telegram
API (`npm run dev` alone, without `dev:mock`, will hit `/api` which
needs a real serverless runtime locally — see the Vercel CLI note below).
On your hosting provider, set the same four variables in its environment
variables / secrets UI:

| Variable | Where it comes from |
|---|---|
| `TELEGRAM_BOT_TOKEN` | @BotFather |
| `TELEGRAM_CHAT_ID` | `getUpdates`, step 1.4 above |
| `ADMIN_PASSWORD_HASH` | `npm run generate-admin-hash` |
| `SESSION_SECRET` | the `crypto.randomBytes` command above |

Never commit `.env` — it's already in `.gitignore`.

### 4. Deploy (Vercel, by default)

**Deploying from a phone (Termux + GitHub)?** Use `bash deploy.sh` and follow
`TERMUX-DEPLOY.md` (written in Hinglish).

This project assumes **Vercel**. The whole API is ONE serverless function
(`api/router.js`), because Vercel's free Hobby plan allows at most 12 functions per
deployment and every file in `api/` counts as one. `vercel.json` rewrites
`/api/<resource>` and `/api/<resource>/<id>` to that function (so the URLs are the
usual ones) and adds the SPA rewrite so client-side routes like `/donations` work on
a hard refresh. Never add more files to `api/`; put new code in `server/`.

```bash
npm i -g vercel     # if you don't have it
vercel               # first deploy, follow the prompts
vercel env add TELEGRAM_BOT_TOKEN
vercel env add TELEGRAM_CHAT_ID
vercel env add ADMIN_PASSWORD_HASH
vercel env add SESSION_SECRET
vercel --prod
```

To test the real API locally before deploying, `vercel dev` runs both the
Vite frontend and the `/api` functions together against your `.env`
file — use this instead of `npm run dev` once you have real Telegram
credentials and want to test them before going live.

**Using Netlify or Cloudflare Pages instead?** `api/router.js` and the handlers in
`server/` use the plain `(req, res)` Node handler style. Netlify Functions and
Cloudflare Pages Functions use a different signature, so they would need a small
adapter; the Telegram storage, auth and validation code (`server/telegramStore.js`,
`server/auth.js`, `server/validators.js`) can be reused as-is.

### 5. Add your real content

Nothing in this project invents committee names, donation amounts, or
contact details — they're either blank, empty, or clearly-marked demo
data until you fill them in:

- **`src/config/festivalConfig.js`** — festival date, location, contact
  info, social links, the home page's "highlights" list.
- **Puja date and muhurat** — `pujaDateTime` (drives the countdown) and
  `pujaDetails` (the date / tithi / muhurat card on the Home and Programme
  pages) in `festivalConfig.js`. Next year, edit just those two.
- **Logo** — `public/logo.png` (navbar, hero, footer) and the browser/app icons
  (`favicon.png`, `icon-192.png`, `icon-512.png`) were made from the Maa
  Saraswati logo you supplied. To change it, replace those files, keeping
  the names.
- **WhatsApp group** — `whatsapp` in `festivalConfig.js` (invite link, group name)
  and the QR image `public/whatsapp-group-qr.png`. It shows as a card on the Home
  and Contact pages and as a link in the footer; tapping the QR or the button
  opens the group in WhatsApp. If you tap "Reset link" in WhatsApp, the old link
  and QR stop working: paste the new link and replace the QR image.
- **`src/config/committee.js`** — committee members (name/position/etc).
  This one is a plain code file, not an admin-panel form, on purpose —
  it should only ever be edited by someone who knows the information is
  accurate.
- Donations, expenses, programme events, gallery photos, and
  announcements are all managed from **`/admin`** once deployed.

## Background artwork (lotus + veena)

Every public page has a lotus + veena background, in three layers. All of it
is original line-art drawn in code — no photos, nothing copied from anyone's
artwork — and none of it appears in the admin panel.

| Layer | Where it lives | How to change it |
|---|---|---|
| Small repeating wallpaper (lotus and veena, in a checkerboard) | `public/patterns/lotus-veena.svg`, applied by the `.puja-wallpaper` class in `src/index.css` and `PublicLayout` in `src/App.jsx` | Stronger or fainter: edit `opacity="0.22"` on the first `<g>` in the SVG. Remove it: delete `puja-wallpaper` from `PublicLayout`. |
| Two large, very faint outlines (a lotus bottom-right, a veena bottom-left) fixed behind the page | `SiteBackdrop` in `src/components/Backdrop.jsx` | Adjust the `opacity-[...]` values, or delete `<SiteBackdrop />` from `PublicLayout`. |
| Full-colour lotus with a veena behind it, under the home-page buttons | `HeroArt` in `src/components/Backdrop.jsx`, used by `src/components/Hero.jsx` | It sways and twinkles very slowly; both are switched off automatically for visitors who have "reduce motion" turned on. |

Text stays readable on top of all of this: the wallpaper and the large
outlines are kept faint on purpose. If you ever find them too strong on a
particular phone, lower the opacity values above rather than removing them.

**Other graphics** (all drawn in code, all in `src/components/`):

- `Decor.jsx` has `LogoBadge` (the logo in a golden seal, used in the hero), `PetalEdge`
  (the lotus-petal edge above the countdown band and the footer), `PageHeader` (title
  block with a faint lotus, used on every inner page) and the ornamental `Divider`.
- `Icons.jsx` has the drawings on the home-page highlight cards (kalash, aarti thali,
  laddu bowl, veena, water with a lotus). In `festivalConfig.js`, each highlight's `icon`
  is one of `kalash`, `aarti`, `laddu`, `music`, `waves`.
- Empty lists (no gallery photos yet, no committee members yet) show a small lotus
  drawing instead of a blank box.

**Link preview image:** `public/og-image.png` (lotus + veena, 1200×630) is
what WhatsApp/Facebook show when someone shares the site. Some apps only
accept a full web address there, so once you know your live domain, change
the `og:image` line in `index.html` to `https://your-domain/og-image.png`.

## Design choices worth knowing about

- **One shared admin password**, not individual accounts — matches how a
  small committee actually works, and keeps the "no traditional backend"
  constraint simple. If you need per-person accounts and an audit trail
  that names each admin individually, that's a bigger change to
  `server/auth.js`.
- **Gallery photos are added by URL**, not uploaded through the site.
  Host images anywhere (Google Photos/Drive public link, etc.) and paste
  the link into the admin form. Building a full upload pipeline into
  Telegram was out of scope for this pass.
- **Date-range filtering** offers Today / This week / This month / a
  custom from–to range — the "custom" option reveals two date pickers
  rather than a single combined range widget.
- **Concurrent admin edits**: writes are read-modify-write against one
  Telegram message, not a transactional database. Two admins saving at
  the exact same instant could overwrite each other. For a small
  committee saving sequentially this is unlikely to matter in practice,
  but it's not bulletproof — avoid two people editing at once.
- **Rate limiting** on the login endpoint is a best-effort, in-memory
  counter (see the comment in `server/auth.js`) — it resets on cold
  start and isn't shared across serverless instances, so it slows down
  casual brute-forcing but isn't a substitute for a real rate-limiting
  service. Use a genuinely long admin password.
- **No sensitive fields are ever collected** for donations (no phone,
  Aadhaar, PAN, bank or UPI details) — sidestepping the "never expose
  sensitive personal information" requirement by simply not storing that
  data in the first place.

## Project structure

```
src/
  config/         festivalConfig.js, adminResources.js (form/table schema), committee.js
  components/     shared UI (Navbar, RecordTable, RecordForm, Toast, Modal, ...)
  components/admin/  admin-only chrome (AdminLayout, DashboardWidgets, RecordForm)
  pages/          one file per public route
  pages/admin/    Login, Dashboard, and a single generic ManageResource.jsx
                  (donations/expenses/events/gallery/announcements all
                  share this one screen, configured from adminResources.js)
  lib/            api.js (fetch client + hooks), format.js (currency/date)
api/
  router.js       the ONE serverless function: every /api/... URL comes through here
server/           everything router.js uses (not deployed as separate functions)
  telegramStore.js, auth.js, resourceHandler.js, validators.js
  routes/         donations.js, expenses.js, events.js, gallery.js, announcements.js
                  (list + create, update + delete), authRoutes.js (login/logout/
                  session), summary.js (public कुल Donation / कुल खर्च / शेष राशि),
                  audit.js (admin-only change log shown on the dashboard)
dev-server/       local-only mock API (never used in production)
```

Admin CRUD for all five resource types is intentionally implemented once,
generically (`RecordForm.jsx`, `RecordTable.jsx`, `ManageResource.jsx`,
`resourceHandler.js`) and configured per-resource from
`src/config/adminResources.js` — rather than five near-duplicate copies of
the same form/table/handler. To add a new field to, say, donations, add
one line to that config file and one to `server/validators.js`.

## If something doesn't work

- **"सर्वर सही से सेटअप नहीं है" errors** mean an environment variable is
  missing on your hosting provider — double check all four are set.
- **A Telegram API error mentioning `chat not found` or `bot is not a
  member`**: the bot needs to already be *in* the group (and admin with
  pin rights) before the first request.
- Since the Telegram calls in `server/telegramStore.js` couldn't be
  tested live while building this, if `editMessageMedia` or
  `sendDocument` behave differently than expected in your testing, that
  file is the one place to look — the rest of the app only ever calls
  `getCollection` / `transact` / `getFullDatabase` from it and doesn't
  care how they're implemented underneath.

Developed by KRISHNA.

## SEO, forms, analytics (added Oct 2026)

Set these environment variables on Vercel (see `.env.example`):

| Variable | What it does |
|---|---|
| `SITE_URL` | Your real https address; used in sitemap.xml, canonical links and OG image URLs |
| `VITE_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile ("Verify you are human") on the contact form. Without the secret the form is refused in production |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics 4 ID (`G-XXXXXXXXXX`); loads only after the visitor accepts the consent bar |

- Page titles / descriptions: `src/config/seo.js` (one place). `npm run build` also writes `sitemap.xml`, `robots.txt`, one HTML file per page (correct WhatsApp preview) and `404.html` (real 404 status).
- After deploying: submit `https://<your-domain>/sitemap.xml` in Google Search Console.
- FAQ: `src/config/faq.js`. Testimonials: `src/config/testimonials.js` (empty = section hidden; add only real, approved quotes).
- Weather: Open-Meteo (free, no key) via `src/lib/weather.js`, shown on Home.
- Contact messages arrive in the private Telegram group through the existing bot.

## Admin panel fixes (Oct 2026)

- Public search could reveal the real name behind an "Anonymous" donation: private fields are now hidden before searching.
- A missing `SESSION_SECRET` or a garbled cookie no longer breaks the public Donations/Expenses pages.
- "Today / This week / This month" filters now use India time (server runs in UTC).
- Each admin section starts with a clean page/search/filter state; deleting the last row of a page steps back a page.
- Expired admin sessions send you back to login with a message; dates no longer shift a day for visitors abroad.
- Input length limits on all records; page size capped at 100; login attempts reset after a correct password.
- UI: icon sidebar, "वेबसाइट देखें" link, dashboard quick-add buttons (`?new=1`), clearer chart colours, gallery thumbnails, show/hide password.

## Saraswati QR codes and UPI donations

- `src/lib/qr.js` is a small QR generator (checked against two independent decoders for versions 1-20, levels L/M/Q/H); `src/lib/qrArt.js` draws it in the Saraswati style (maroon modules, gold petal border, goddess logo in the centre, error-correction H so it still scans).
- The WhatsApp card now draws its QR from `festivalConfig.whatsapp.inviteUrl`, so a new invite link updates the QR automatically. A 1200 px print version is in `public/whatsapp-group-qr-saraswati.png`.
- Donations page: `DonatePanel` shows a UPI QR (amount chips or custom amount) once `festivalConfig.donation.upiId` is filled in. Until then it shows "coming soon". Money goes directly to the committee's bank account; the committee then adds the donation to the ledger in the admin panel.


## Admin: UPI settings & custom payment QR
Admin panel > **UPI सेटिंग / QR** (`/admin/upi-settings`). The admin sets the committee UPI ID, payee name, note and quick amounts; they are stored with the other data (Telegram JSON, `settings.donation`) via `PUT /api/settings` (admin only; `GET` is public and returns only the donation block). The public Donations page reads them and falls back to `festivalConfig.donation`. The same page generates a custom payment QR (amount / note / name) to download as PNG or copy as a UPI link. Changes are written to the audit log.

## Own payment gateway (UPI checkout + reconciliation)
Donations page > "नाम के साथ दान दर्ज करें": donor enters name/phone, gets a UPI QR carrying a unique reference (`BSP-XXXXXX`, in the UPI note and `tr`), pays in any UPI app, then submits the UTR. The payment is stored as `pending` (`/api/payments`). Admin > **ऑनलाइन भुगतान** checks the bank statement and presses Confirm, which creates the donation record automatically (or Reject). Money goes straight to the committee's bank account; the site never touches it. Auto-confirmation needs a licensed gateway (Razorpay/Cashfree/PhonePe PG) with webhooks - not included.


## Visitor sign-up (real e-mail only) + profile photo
`/signup`, `/login`, `/account`. Sign-up checks, in order: e-mail syntax, a blocklist of temp-mail domains (`server/emailCheck.js`, extend with `DISPOSABLE_EXTRA`), the domain must have mail servers (MX lookup), Turnstile + honeypot + per-IP limits - and finally a 6-digit code mailed to the address (valid 10 min, 5 tries, 60 s resend gap, 5 mails/hour). Only after the code is entered is the account active and logged in (httpOnly `user_session` cookie, 30 days). Passwords are scrypt-hashed. Mail goes out through Brevo's free HTTP API (`BREVO_API_KEY`, `MAIL_FROM_EMAIL`, see `.env.example`); with no key it is logged locally in development and refused in production.
Profile photo: JPG/PNG/WEBP, max 2 MB, checked by declared type AND file signature, max 10 uploads/hour/user, old photo deleted on replace, orphan deleted if the DB save fails. The browser shrinks the photo to 512x512 first. Multer's `uploads/` disk folder cannot persist on Vercel, so files are kept as Telegram documents (same storage as the database) and served by `GET /api/users/avatar?u=<id>`.

## Login / sign-up: animation + Google / Microsoft sign-in
Designed in Figma (frames "User / Login, Signup, Verify code, Success") and built with framer-motion in `src/components/auth/`: `AuthShell` (cosmic-mandala panel, word-by-word headline reveal, blur-in glass card, staggered fields), `OtpInput` (six boxes, shake on a wrong code), `SuccessBurst`, `SocialButtons`. Everything respects `prefers-reduced-motion`.
"Continue with Google / Microsoft (Hotmail, Outlook, Live)" is a server-side OAuth 2.0 code flow (`server/routes/oauth.js`, signed state + nonce cookie against CSRF). Buttons appear only for providers whose keys are set (`GOOGLE_*`, `MICROSOFT_*`, `SITE_URL` in `.env.example`). Register the redirect URI `<SITE_URL>/api/users/oauth-callback` at both providers. The provider has already verified the mailbox, so no code is e-mailed.

## Admin: Committee, Telegram check
Admin > **समिति सदस्य** adds / edits / deletes members (name, position, occupation, village, order); the public Committee page reads them (`src/config/committee.js` entries still show too). Admin > Dashboard > **Telegram जाँच** sends a test message and shows Telegram's real error if the bot / chat id is wrong. The contact form no longer needs Turnstile keys to reach Telegram (it then relies on the honeypot + rate limit). New online donations and new members are also announced in the Telegram group.

Cosmic mandala (no audio): markup in `src/lib/cosmicSvg.js`, motion in `components/auth/AuthArt.jsx`. Six SVG rings (crown petals, Sanskrit mantra band, floral arches, yantra, 12 lotus petals, sun rays) turn in alternating directions around a Maa Saraswati medallion (public/logo.png, via festivalConfig.logoSrc); one canvas draws twinkling stars, golden dust, falling lotus/marigold petals and ten flickering diyas orbiting on a tilted ring. A petal shower plays after the intro; click the canvas for petals, click the medallion for a shockwave. Pointer parallax; `prefers-reduced-motion` renders a still frame. Needs the Rozha One font (already in `index.html`).
