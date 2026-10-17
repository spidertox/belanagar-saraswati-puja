// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/emailCheck.js
import { resolveMx, resolve4 } from "/home/claude/site_src/belanagar-saraswati-puja/stub-dns.mjs";
var DISPOSABLE = new Set(`
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
var SUSPICIOUS = /(temp-?mail|tempmail|10-?minute|guerrilla|throwaway|trash-?mail|mailinator|yopmail|fake-?(mail|inbox)|disposable|burner|spambox|getnada|dispostable)/i;
var EXTRA = (process.env.DISPOSABLE_EXTRA || "").split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
var EMAIL = /^[a-z0-9._%+-]{1,64}@([a-z0-9-]+(\.[a-z0-9-]+)+)$/;
function normalizeEmail(input) {
  return String(input || "").trim().toLowerCase();
}
function isDisposableDomain(domain) {
  const d = String(domain).toLowerCase();
  if (EXTRA.includes(d)) return true;
  const parts = d.split(".");
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (DISPOSABLE.has(parts.slice(i).join("."))) return true;
  }
  return SUSPICIOUS.test(d);
}
async function checkEmail(email) {
  const m = EMAIL.exec(email);
  if (!m || email.length > 254 || email.includes("..")) return "\u0915\u0943\u092A\u092F\u093E \u0938\u0939\u0940 \u0908\u092E\u0947\u0932 \u092A\u0924\u093E \u0932\u093F\u0916\u0947\u0902\u0964";
  const domain = m[1];
  if (isDisposableDomain(domain)) return "\u0905\u0938\u094D\u0925\u093E\u092F\u0940 (temp) \u0908\u092E\u0947\u0932 \u092E\u093E\u0928\u094D\u092F \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u0915\u0943\u092A\u092F\u093E \u0905\u092A\u0928\u093E \u0905\u0938\u0932\u0940 \u0908\u092E\u0947\u0932 \u0909\u092A\u092F\u094B\u0917 \u0915\u0930\u0947\u0902\u0964";
  try {
    const mx = await resolveMx(domain);
    if (!mx || mx.length === 0) throw new Error("no mx");
  } catch (e) {
    if (e && (e.code === "ENOTFOUND" || e.code === "ENODATA" || e.message === "no mx")) {
      try {
        const a = await resolve4(domain);
        if (a && a.length) return "";
      } catch {
      }
      return "\u0907\u0938 \u0908\u092E\u0947\u0932 \u0915\u093E \u0921\u094B\u092E\u0947\u0928 \u092E\u0947\u0932 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0928\u0939\u0940\u0902 \u0915\u0930 \u0938\u0915\u0924\u093E\u0964 \u0915\u0943\u092A\u092F\u093E \u0908\u092E\u0947\u0932 \u091C\u093E\u0902\u091A\u0947\u0902\u0964";
    }
  }
  return "";
}

export {
  normalizeEmail,
  isDisposableDomain,
  checkEmail
};
