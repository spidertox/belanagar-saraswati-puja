import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, Phone, MessageCircle } from 'lucide-react';
import { festivalConfig } from '../config/festivalConfig.js';
import { Divider, PetalEdge } from './Decor.jsx';

export default function Footer() {
  const { contact, social, nameHindi, nameEnglish, developerCredit } = festivalConfig;
  const hasSocial = Boolean(social.facebook || social.instagram || social.youtube);
  const whatsappUrl = (festivalConfig.whatsapp && festivalConfig.whatsapp.inviteUrl) || '';
  const hasContact = Boolean(contact.phone || contact.email || whatsappUrl);

  return (
    <>
      <div className="-mb-px text-navy-900" aria-hidden="true">
        <PetalEdge />
      </div>
      <footer className="bg-navy-900 text-ivory-100">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img
              src={festivalConfig.logoSrc}
              alt=""
              width={festivalConfig.logoWidth}
              height={festivalConfig.logoHeight}
              className="mb-3 h-16 w-auto"
            />
            <p className="devanagari text-xl text-basanti-400">{nameHindi}</p>
            <p className="mt-2 text-sm text-ivory-100/70">
              विद्या, संगीत और ज्ञान की देवी माँ सरस्वती को समर्पित एक सामुदायिक आयोजन।
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-ivory-50">Quick Links</p>
            <ul className="mt-3 space-y-2 text-sm text-ivory-100/70">
              <li><Link to="/about" className="hover:text-basanti-400">हमारे बारे में</Link></li>
              <li><Link to="/events" className="hover:text-basanti-400">पूजा कार्यक्रम</Link></li>
              <li><Link to="/gallery" className="hover:text-basanti-400">Gallery</Link></li>
              <li><Link to="/committee" className="hover:text-basanti-400">Committee</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-ivory-50">पारदर्शिता</p>
            <ul className="mt-3 space-y-2 text-sm text-ivory-100/70">
              <li><Link to="/donations" className="hover:text-basanti-400">Donation विवरण</Link></li>
              <li><Link to="/expenses" className="hover:text-basanti-400">खर्च का विवरण</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-ivory-50">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-ivory-100/70">
              {contact.phone ? (
                <li className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" /> {contact.phone}
                </li>
              ) : null}
              {contact.email ? (
                <li className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" /> {contact.email}
                </li>
              ) : null}
              {whatsappUrl ? (
                <li>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-basanti-400"
                  >
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> WhatsApp ग्रुप से जुड़ें
                  </a>
                </li>
              ) : null}
              {!hasContact ? <li className="text-ivory-100/50">जल्द ही संपर्क जानकारी उपलब्ध होगी।</li> : null}
            </ul>
            {hasSocial ? (
              <div className="mt-4 flex gap-3">
                {social.facebook ? (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="text-ivory-100/70 hover:text-basanti-400"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                ) : null}
                {social.instagram ? (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="text-ivory-100/70 hover:text-basanti-400"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                ) : null}
                {social.youtube ? (
                  <a
                    href={social.youtube}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube"
                    className="text-ivory-100/70 hover:text-basanti-400"
                  >
                    <Youtube className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <Divider className="my-8 opacity-40" />

        <div className="flex flex-col items-center justify-between gap-2 text-xs text-ivory-100/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {nameEnglish}</p>
          <p>Developed by {developerCredit}</p>
        </div>
      </div>
      </footer>
    </>
  );
}
