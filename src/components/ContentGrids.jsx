import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Flower2, UtensilsCrossed, Music, Waves, Flame } from 'lucide-react';
import Lightbox from './Lightbox.jsx';
import { formatDate } from '../lib/format.js';
import { LotusIcon } from './Decor.jsx';

// Programme is genuinely chronological, so a connected timeline (not a
// plain card grid) is the right structural device here. Each card gets an
// icon from its name, and "today" / finished events are marked.
const KINDS = [
  [/पुष्पांजलि|अंजलि|pushpanjali|anjali/i, Flower2],
  [/भोग|प्रसाद|भंडारा|bhog|prasad/i, UtensilsCrossed],
  [/सांस्कृतिक|नृत्य|गीत|संगीत|गायन|नाटक|cultural|music|dance/i, Music],
  [/विसर्जन|visarjan/i, Waves],
  [/आरती|दीप|aarti|arti/i, Flame],
];
const iconFor = (name) => (KINDS.find(([re]) => re.test(name || '')) || [])[1] || null;
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
const badge = (d) => {
  const date = new Date(`${String(d).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return {
    day: date.toLocaleDateString('en-GB', { day: '2-digit', timeZone: 'UTC' }),
    mon: date.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }),
  };
};

export function EventTimeline({ events }) {
  const now = today();
  return (
    <ol className="relative space-y-6 border-l border-gold-300 pl-6 sm:pl-8">
      {events.map((ev) => {
        const Icon = iconFor(ev.name);
        const day = String(ev.date).slice(0, 10);
        const isToday = day === now;
        const past = day < now;
        const b = badge(ev.date);
        return (
          <motion.li
            key={ev.id}
            className="relative"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className={`absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full sm:-left-[39px] ${isToday ? 'bg-maroon-700 text-ivory-50 ring-4 ring-gold-300/60' : 'bg-ivory-50 text-gold-500'}`}>
              {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : <LotusIcon className="h-4 w-4" />}
            </span>
            <div className={`card-lift flex gap-4 rounded-2xl border bg-white p-4 shadow-card sm:p-5 ${isToday ? 'border-maroon-700/50' : 'border-gold-300/30'} ${past ? 'opacity-75' : ''}`}>
              {b ? (
                <div className="flex h-16 w-14 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-gold-50 text-maroon-700">
                  <span className="text-xl font-semibold leading-none">{b.day}</span>
                  <span className="mt-1 text-xs uppercase tracking-wide text-gold-600">{b.mon}</span>
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="devanagari text-lg text-maroon-700">{ev.name}</h3>
                  {isToday ? <span className="rounded-full bg-maroon-700 px-2 py-0.5 text-[11px] font-medium text-ivory-50">आज</span> : null}
                  {past ? <span className="rounded-full bg-navy-900/10 px-2 py-0.5 text-[11px] text-navy-600">संपन्न</span> : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-navy-600">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" /> {formatDate(ev.date)}
                  </span>
                  {ev.time ? (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {ev.time}
                    </span>
                  ) : null}
                  {ev.location ? (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {ev.location}
                    </span>
                  ) : null}
                </div>
                {ev.description ? <p className="devanagari-body mt-3 text-sm text-navy-700">{ev.description}</p> : null}
              </div>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

export function GalleryGrid({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <>
      <div className="columns-2 gap-4 sm:columns-3">
        {items.map((item, i) => (
          <figure key={item.id} className="group mb-4 break-inside-avoid overflow-hidden rounded-xl bg-white shadow-card">
            <button type="button" onClick={() => setOpen(i)} aria-label={`तस्वीर बड़ी करें${item.caption ? `: ${item.caption}` : ''}`} className="block w-full cursor-zoom-in overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.caption || `बेलानगर सरस्वती पूजा की तस्वीर${item.category ? ` - ${item.category}` : ''}`}
                loading="lazy"
                decoding="async"
                className="w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </button>
            {item.caption ? <figcaption className="px-3 py-2 text-xs text-navy-600">{item.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
      <Lightbox items={items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}

export function CommitteeGrid({ members }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((m, i) => (
        <div key={i} className="rounded-2xl bg-white p-5 text-center shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-100 text-lg font-medium text-maroon-700">
            {m.name ? m.name.charAt(0) : '?'}
          </div>
          <p className="devanagari mt-3 text-base text-maroon-700">{m.name}</p>
          {m.position ? <p className="text-sm text-gold-600">{m.position}</p> : null}
          {m.occupation ? <p className="mt-1 text-xs text-navy-500">{m.occupation}</p> : null}
          {m.village ? <p className="text-xs text-navy-500">{m.village}</p> : null}
        </div>
      ))}
    </div>
  );
}
