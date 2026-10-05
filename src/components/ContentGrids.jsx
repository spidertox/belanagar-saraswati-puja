import { Calendar, Clock, MapPin } from 'lucide-react';
import { formatDate } from '../lib/format.js';
import { LotusIcon } from './Decor.jsx';

// Programme is genuinely chronological, so a connected timeline (not a
// plain card grid) is the right structural device here.
export function EventTimeline({ events }) {
  return (
    <ol className="relative space-y-8 border-l border-gold-300 pl-6 sm:pl-8">
      {events.map((ev) => (
        <li key={ev.id} className="relative">
          <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-ivory-50 text-gold-500 sm:-left-[39px]">
            <LotusIcon className="h-4 w-4" />
          </span>
          <div className="rounded-2xl bg-white p-5 shadow-card">
            <h3 className="devanagari text-lg text-maroon-700">{ev.name}</h3>
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
            {ev.description ? <p className="mt-3 text-sm text-navy-700">{ev.description}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function GalleryGrid({ items }) {
  return (
    <div className="columns-2 gap-4 sm:columns-3">
      {items.map((item) => (
        <figure key={item.id} className="mb-4 break-inside-avoid overflow-hidden rounded-xl bg-white shadow-card">
          <img
            src={item.imageUrl}
            alt={item.caption || 'पूजा की तस्वीर'}
            loading="lazy"
            className="w-full object-cover"
          />
          {item.caption ? <figcaption className="px-3 py-2 text-xs text-navy-600">{item.caption}</figcaption> : null}
        </figure>
      ))}
    </div>
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
