import { festivalConfig } from '../config/festivalConfig.js';
import { SectionHeading } from './Decor.jsx';

// YouTube live darshan. Hidden until festivalConfig.liveYoutubeId is set.
// The 16:9 box is reserved up front so the page does not jump when it loads.
export default function LiveEmbed({ className = '' }) {
  const id = (festivalConfig.liveYoutubeId || '').trim();
  if (!/^[\w-]{11}$/.test(id)) return null;
  return (
    <section aria-labelledby="live-title" className={`mx-auto max-w-3xl px-4 pt-14 sm:px-6 ${className}`}>
      <SectionHeading hindi="लाइव दर्शन" english="Watch the puja live" align="center" />
      <h2 id="live-title" className="sr-only">पूजा का सीधा प्रसारण</h2>
      <div className="mt-6 aspect-video overflow-hidden rounded-2xl border border-gold-300/50 bg-navy-900 shadow-lift">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title="बेलानगर सरस्वती पूजा - सीधा प्रसारण"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
    </section>
  );
}
