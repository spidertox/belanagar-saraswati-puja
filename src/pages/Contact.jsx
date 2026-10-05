import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { festivalConfig } from '../config/festivalConfig.js';
import { PageHeader } from '../components/Decor.jsx';
import WhatsAppGroupCard from '../components/WhatsAppGroupCard.jsx';

export default function Contact() {
  const { contact, social, location, address, coordinates } = festivalConfig;
  const hasContact = Boolean(contact.phone || contact.email || address);
  const hasSocial = Boolean(social.facebook || social.instagram || social.youtube);
  const mapSrc = coordinates ? `https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=15&output=embed` : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <PageHeader hindi="संपर्क करें" english="Contact" />

      <div className="space-y-4 rounded-2xl bg-white p-6 shadow-card">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 flex-shrink-0 text-gold-500" aria-hidden="true" />
          <span className="text-sm text-navy-700">{address || location}</span>
        </div>
        {contact.phone ? (
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 flex-shrink-0 text-gold-500" aria-hidden="true" />
            <a href={`tel:${contact.phone}`} className="text-sm text-navy-700 hover:text-maroon-700">
              {contact.phone}
            </a>
          </div>
        ) : null}
        {contact.email ? (
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 flex-shrink-0 text-gold-500" aria-hidden="true" />
            <a href={`mailto:${contact.email}`} className="text-sm text-navy-700 hover:text-maroon-700">
              {contact.email}
            </a>
          </div>
        ) : null}
        {!hasContact ? <p className="text-sm text-navy-500">जल्द ही यहां संपर्क जानकारी उपलब्ध होगी।</p> : null}

        {hasSocial ? (
          <div className="flex gap-4 border-t border-navy-900/5 pt-4">
            {social.facebook ? (
              <a href={social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="text-navy-500 hover:text-maroon-700">
                <Facebook className="h-5 w-5" />
              </a>
            ) : null}
            {social.instagram ? (
              <a href={social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-navy-500 hover:text-maroon-700">
                <Instagram className="h-5 w-5" />
              </a>
            ) : null}
            {social.youtube ? (
              <a href={social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="text-navy-500 hover:text-maroon-700">
                <Youtube className="h-5 w-5" />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      <WhatsAppGroupCard className="mt-8" />

      {mapSrc ? (
        <div className="mt-8 overflow-hidden rounded-2xl shadow-card">
          <iframe
            title="Belanagar location"
            src={mapSrc}
            className="h-72 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : null}
    </div>
  );
}
