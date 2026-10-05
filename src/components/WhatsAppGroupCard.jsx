import { MessageCircle } from 'lucide-react';
import { festivalConfig } from '../config/festivalConfig.js';

// Committee WhatsApp group. The QR code and the button both open the group's
// invite link, so one tap on a phone opens WhatsApp straight on the group.
// Everything comes from `festivalConfig.whatsapp`; with no inviteUrl the card
// is simply not shown.
export default function WhatsAppGroupCard({ className = '' }) {
  const wa = festivalConfig.whatsapp;
  if (!wa || !wa.inviteUrl) return null;

  return (
    <section
      aria-labelledby="whatsapp-title"
      className={`rounded-2xl border border-gold-300/60 bg-white p-5 shadow-card sm:p-7 ${className}`}
    >
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-8 sm:text-left">
        {wa.qrSrc ? (
          <a
            href={wa.inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp ग्रुप खोलें"
            className="flex-shrink-0 rounded-2xl border border-navy-900/10 bg-white p-1.5 transition hover:shadow-card"
          >
            <img
              src={wa.qrSrc}
              alt="WhatsApp ग्रुप का QR कोड"
              width={wa.qrSize}
              height={wa.qrSize}
              loading="lazy"
              className="h-40 w-40 sm:h-44 sm:w-44"
            />
          </a>
        ) : null}

        <div>
          <h2 id="whatsapp-title" className="devanagari text-xl text-maroon-700 sm:text-2xl">
            WhatsApp ग्रुप से जुड़ें
          </h2>
          {wa.groupName ? (
            <p className="devanagari-body mt-1 text-sm font-medium text-navy-700">{wa.groupName}</p>
          ) : null}
          <p className="devanagari-body mt-2 text-sm text-navy-600">
            QR स्कैन करें या नीचे का बटन दबाएँ, WhatsApp में ग्रुप सीधे खुल जाएगा।
          </p>
          {wa.joinNote ? <p className="devanagari-body mt-1 text-xs text-navy-500">{wa.joinNote}</p> : null}
          <a
            href={wa.inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-whatsapp-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-whatsapp-600"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            ग्रुप खोलें
          </a>
        </div>
      </div>
    </section>
  );
}
