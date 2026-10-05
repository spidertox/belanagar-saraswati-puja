import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Countdown from '../components/Countdown.jsx';
import AnnouncementBanner from '../components/AnnouncementBanner.jsx';
import PujaDetails from '../components/PujaDetails.jsx';
import WhatsAppGroupCard from '../components/WhatsAppGroupCard.jsx';
import { SectionHeading, Divider } from '../components/Decor.jsx';
import { HIGHLIGHT_ICONS, KalashIcon } from '../components/Icons.jsx';
import { festivalConfig } from '../config/festivalConfig.js';

export default function Home() {
  return (
    <div>
      <Hero />
      <Countdown />
      <AnnouncementBanner />

      <div className="mx-auto max-w-3xl px-4 pt-14 sm:px-6">
        <PujaDetails />
      </div>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading hindi="इस वर्ष क्या-क्या होगा" english="Festival highlights" align="center" />
        <Divider className="my-6" />
        <div className="flex flex-wrap justify-center gap-5">
          {festivalConfig.highlights.map((h) => {
            const Icon = HIGHLIGHT_ICONS[h.icon] || KalashIcon;
            return (
              <div
                key={h.id}
                className="flex w-full items-center gap-4 rounded-2xl border border-gold-300/40 bg-white p-5 shadow-card sm:w-[calc(50%_-_0.625rem)] sm:flex-col sm:items-start sm:gap-0 lg:w-[calc(33.333%_-_0.84rem)]"
              >
                <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-50 to-gold-100 text-maroon-600 sm:h-[4.5rem] sm:w-[4.5rem]">
                  <Icon className="h-10 w-10 sm:h-11 sm:w-11" />
                </span>
                <div className="sm:mt-4">
                  <h3 className="devanagari text-lg text-maroon-700 sm:text-xl">{h.titleHindi}</h3>
                  <p className="devanagari-body mt-1 text-sm text-navy-600">{h.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <WhatsAppGroupCard />
      </div>

      <section className="bg-gold-50/70 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <SectionHeading hindi="पूर्ण पारदर्शिता" english="Every rupee, accounted for" align="center" />
          <p className="devanagari-body mx-auto mt-4 max-w-xl text-sm text-navy-700">
            हर दान और हर खर्च का विवरण सार्वजनिक है। कोई भी, कभी भी देख सकता है।
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/donations"
              className="rounded-full bg-maroon-700 px-6 py-3 text-sm font-medium text-ivory-50 transition hover:bg-maroon-600"
            >
              दान विवरण देखें
            </Link>
            <Link
              to="/expenses"
              className="rounded-full border border-maroon-700 px-6 py-3 text-sm font-medium text-maroon-700 transition hover:bg-maroon-700 hover:text-ivory-50"
            >
              खर्च का विवरण
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
