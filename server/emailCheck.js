// "Real e-mail" checks, cheapest first:
//   1. syntax  2. disposable / temp-mail blocklist  3. the domain must have mail
//   servers (MX). The final proof is the one-time code sent to the inbox.
import { resolveMx, resolve4 } from 'node:dns/promises';

const DISPOSABLE = new Set(`
mailinator.com mailinator.net guerrillamail.com guerrillamail.net guerrillamail.org guerrillamail.biz guerrillamail.de guerrillamailblock.com sharklasers.com grr.la spam4.me pokemail.net
10minutemail.com 10minutemail.net 10minutemail.org 10minemail.com 20minutemail.com 30minutemail.com minutemail.com tempmail.com temp-mail.org temp-mail.io temp-mail.ru tempmail.net tempmail.dev tempmail.email tempmailo.com
tempr.email tempail.com tempinbox.com temporary-mail.net temporaryemail.net yopmail.com yopmail.net yopmail.fr cool.fr.nf jetable.fr.nf nospam.ze.tc nomail.xl.cx mega.zik.dj speed.1s.fr courriel.fr.nf moncourrier.fr.nf monemail.fr.nf monmail.fr.nf
trashmail.com trashmail.net trashmail.org trashmail.de trashmail.io trashmail.me trash-mail.com trash-mail.de wegwerfmail.de wegwerfmail.net wegwerfmail.org getnada.com nada.email dispostable.com maildrop.cc mailnesia.com
throwawaymail.com throwam.com fakeinbox.com fakemail.net fakemailgenerator.com mintemail.com mohmal.com emailondeck.com burnermail.io moakt.com moakt.cc tmpmail.org tmpmail.net mytemp.email mytrashmail.com
spamgourmet.com spambox.us spamex.com spamfree24.org discard.email discardmail.com discardmail.de dropmail.me emailfake.com email-fake.com fakeemail.org gettempmail.com guerrillamail.info inboxkitten.com
harakirimail.com incognitomail.com instantemailaddress.com jourrapide.com armyspy.com cuvox.de dayrep.com einrot.com fleckens.hu gustr.com rhyta.com superrito.com teleworm.us
mailcatch.com mailforspam.com mailnull.com mailsac.com mailtemp.info mailtothis.com mintemail.com mt2015.com mytempemail.com nowmymail.com objectmail.com owlpic.com
sogetthis.com spam.la spamavert.com spamherelots.com spamhereplease.com spamhole.com spamify.com spaml.com supermailer.jp tempemail.co.za tempemail.com tempemail.net tempmailaddress.com
tempsky.com throwawayemailaddress.com trbvm.com trillianpro.com twinmail.de wh4f.org yepmail.net zippymail.info zoemail.org 33mail.com anonbox.net anonymbox.com binkmail.com bobmail.info bccto.me
chacuo.net cheatmail.de deadaddress.com despam.it devnullmail.com dingbone.com dodgeit.com dodgit.com dontreg.com e4ward.com emailias.com emailsensei.com emailtemporanea.net emailwarden.com
fastacura.com filzmail.com get2mail.fr getairmail.com guerrillamail.com haltospam.com imails.info inbox.si inboxalias.com jetable.org kasmail.com klzlk.com kurzepost.de lroid.com lookugly.com
mailexpire.com mailmetrash.com mailmoat.com mailzilla.com meltmail.com messagebeamer.de mierdamail.com nepwk.com no-spam.ws noclickemail.com nobulk.com notmailinator.com
nwldx.com pjjkp.com plexolan.de pookmail.com privacy.net proxymail.eu putthisinyourspamdatabase.com quickinbox.com rcpt.at reallymymail.com recode.me regbypass.com safetymail.info
sendspamhere.com shiftmail.com skeefmail.com slopsbox.com smellfear.com snakemail.com sneakemail.com sofort-mail.de spamstack.net spamthis.co.uk tagyourself.com thankyou2010.com
thisisnotmyrealemail.com tradermail.info trash2009.com trashymail.com turual.com uggsrock.com veryrealemail.com vomoto.com wegwerfadresse.de wuzupmail.net xagloo.com yuurok.com zehnminutenmail.com
1secmail.com 1secmail.net 1secmail.org esiix.com wwjmp.com vjuum.com laafd.com txcct.com kzccv.com qiott.com oosln.com icznn.com ezztt.com cevipsa.com
tmail.ws tmails.net tmpeml.com tmpbox.net mail.tm mail.gw internxt.com smailpro.com luxusmail.org emltmp.com fakemailbox.com maildu.de inboxbear.com
`.split(/\s+/).filter(Boolean));

// Words that nearly only appear in throw-away providers.
const SUSPICIOUS = /(temp-?mail|tempmail|10-?minute|guerrilla|throwaway|trash-?mail|mailinator|yopmail|fake-?(mail|inbox)|disposable|burner|spambox|getnada|dispostable)/i;

const EXTRA = (process.env.DISPOSABLE_EXTRA || '').split(',').map((d) => d.trim().toLowerCase()).filter(Boolean);

const EMAIL = /^[a-z0-9._%+-]{1,64}@([a-z0-9-]+(\.[a-z0-9-]+)+)$/;

export function normalizeEmail(input) {
  return String(input || '').trim().toLowerCase();
}

export function isDisposableDomain(domain) {
  const d = String(domain).toLowerCase();
  if (EXTRA.includes(d)) return true;
  const parts = d.split('.');
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (DISPOSABLE.has(parts.slice(i).join('.'))) return true; // also catches sub-domains
  }
  return SUSPICIOUS.test(d);
}

/** Returns an error message (Hindi) or '' when the address looks real. */
export async function checkEmail(email) {
  const m = EMAIL.exec(email);
  if (!m || email.length > 254 || email.includes('..')) return 'कृपया सही ईमेल पता लिखें।';
  const domain = m[1];
  if (isDisposableDomain(domain)) return 'अस्थायी (temp) ईमेल मान्य नहीं है। कृपया अपना असली ईमेल उपयोग करें।';
  try {
    const mx = await resolveMx(domain);
    if (!mx || mx.length === 0) throw new Error('no mx');
  } catch (e) {
    if (e && (e.code === 'ENOTFOUND' || e.code === 'ENODATA' || e.message === 'no mx')) {
      // some domains accept mail on the A record alone
      try {
        const a = await resolve4(domain);
        if (a && a.length) return '';
      } catch {
        /* fall through */
      }
      return 'इस ईमेल का डोमेन मेल प्राप्त नहीं कर सकता। कृपया ईमेल जांचें।';
    }
    // DNS temporarily unreachable: do not block a real person; the OTP still proves the inbox.
  }
  return '';
}
