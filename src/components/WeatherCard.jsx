import { useEffect, useState } from 'react';
import { Droplets, Wind, Thermometer, Umbrella } from 'lucide-react';
import { festivalConfig } from '../config/festivalConfig.js';
import { describeWeather, fetchWeather, forecastDaysFor } from '../lib/weather.js';
import { SectionHeading } from './Decor.jsx';

function dayLabel(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return {
    week: d.toLocaleDateString('hi-IN', { weekday: 'short' }),
    date: d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' }),
  };
}

// Live weather for Belanagar (coordinates from festivalConfig) using the
// free Open-Meteo API. If the request fails the card simply doesn't appear.
export default function WeatherCard() {
  const { coordinates, pujaDateTime } = festivalConfig;
  const [state, setState] = useState({ status: 'loading', data: null });

  const pujaDate = pujaDateTime ? new Date(pujaDateTime) : null;
  const pujaISO = pujaDate
    ? new Date(pujaDate.getTime() + 5.5 * 3600000).toISOString().slice(0, 10) // date in IST
    : null;

  useEffect(() => {
    if (!coordinates) return undefined;
    const ctrl = new AbortController();
    fetchWeather({
      lat: coordinates.lat,
      lng: coordinates.lng,
      days: forecastDaysFor(pujaDate),
      signal: ctrl.signal,
    })
      .then((data) => setState({ status: 'ok', data }))
      .catch((err) => {
        if (err && err.name === 'AbortError') return;
        setState({ status: 'error', data: null });
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!coordinates || state.status === 'error') return null;

  if (state.status === 'loading') {
    return (
      <section aria-label="मौसम" className="mx-auto max-w-3xl px-4 pt-14 sm:px-6">
        <div className="h-56 animate-pulse rounded-3xl bg-gold-50" aria-hidden="true" />
      </section>
    );
  }

  const { current, days } = state.data;
  const now = describeWeather(current.code);
  const pujaDay = days.find((d) => d.date === pujaISO);
  const strip = days.slice(0, 7);

  return (
    <section aria-label="बेलानगर का मौसम" className="mx-auto max-w-3xl px-4 pt-14 sm:px-6">
      <SectionHeading hindi="बेलानगर का मौसम" english="Weather in Belanagar" align="center" />

      <div className="mt-6 overflow-hidden rounded-3xl border border-gold-300/50 bg-gradient-to-br from-white via-ivory-50 to-gold-50 shadow-card">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <span className="text-6xl leading-none" role="img" aria-label={now.label}>
              {now.icon}
            </span>
            <div>
              <p className="font-display text-5xl font-medium tabular-nums text-maroon-700">{current.temp}°C</p>
              <p className="devanagari-body text-sm text-navy-700">{now.label}</p>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-4 text-center text-xs text-navy-600 sm:text-sm">
            <div>
              <Thermometer className="mx-auto h-4 w-4 text-gold-500" aria-hidden="true" />
              <dt className="mt-1">महसूस</dt>
              <dd className="font-semibold text-navy-800">{current.feelsLike}°C</dd>
            </div>
            <div>
              <Droplets className="mx-auto h-4 w-4 text-gold-500" aria-hidden="true" />
              <dt className="mt-1">नमी</dt>
              <dd className="font-semibold text-navy-800">{current.humidity}%</dd>
            </div>
            <div>
              <Wind className="mx-auto h-4 w-4 text-gold-500" aria-hidden="true" />
              <dt className="mt-1">हवा</dt>
              <dd className="font-semibold text-navy-800">{current.wind} km/h</dd>
            </div>
          </dl>
        </div>

        {pujaDay ? (
          <div className="border-t border-gold-300/40 bg-maroon-700 px-6 py-3 text-center text-sm text-ivory-100">
            <span className="devanagari">पूजा के दिन का पूर्वानुमान:</span> {describeWeather(pujaDay.code).icon}{' '}
            {describeWeather(pujaDay.code).label}, {pujaDay.min}°-{pujaDay.max}°C
          </div>
        ) : null}

        <ul className="grid grid-cols-4 border-t border-gold-300/40 bg-white/60 sm:grid-cols-7">
          {strip.map((d, i) => {
            const w = describeWeather(d.code);
            const lbl = dayLabel(d.date);
            return (
              <li
                key={d.date}
                className={`flex flex-col items-center gap-0.5 px-1 py-3 text-center text-xs ${
                  d.date === pujaISO ? 'bg-gold-100/70' : ''
                } ${i > 3 ? 'hidden sm:flex' : ''}`}
              >
                <span className="font-medium text-navy-700">{i === 0 ? 'आज' : lbl.week}</span>
                <span className="text-[10px] text-navy-400">{lbl.date}</span>
                <span className="text-2xl" role="img" aria-label={w.label}>
                  {w.icon}
                </span>
                <span className="font-semibold text-navy-800">
                  {d.max}° <span className="font-normal text-navy-400">{d.min}°</span>
                </span>
                <span className="flex items-center gap-0.5 text-[10px] text-navy-500">
                  <Umbrella className="h-3 w-3" aria-hidden="true" />
                  {d.rain ?? 0}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-2 text-center text-[11px] text-navy-400">
        Weather data by{' '}
        <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline">
          Open-Meteo.com
        </a>
      </p>
    </section>
  );
}
