// Free weather from Open-Meteo (https://open-meteo.com): no API key, no
// sign-up, CORS-enabled, so the browser can call it directly. Free for
// non-commercial use; the site shows the required "Weather data by
// Open-Meteo.com" credit (CC BY 4.0).
const ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
const CACHE_MS = 30 * 60 * 1000; // re-use a result for 30 minutes

// WMO weather codes -> Hindi label + emoji
const WMO = {
  0: ['साफ़ आसमान', '☀️'],
  1: ['लगभग साफ़', '🌤️'],
  2: ['आंशिक बादल', '⛅'],
  3: ['घने बादल', '☁️'],
  45: ['कोहरा', '🌫️'],
  48: ['घना कोहरा', '🌫️'],
  51: ['हल्की फुहार', '🌦️'],
  53: ['फुहार', '🌦️'],
  55: ['तेज़ फुहार', '🌧️'],
  56: ['ठंडी फुहार', '🌧️'],
  57: ['ठंडी फुहार', '🌧️'],
  61: ['हल्की बारिश', '🌦️'],
  63: ['बारिश', '🌧️'],
  65: ['तेज़ बारिश', '🌧️'],
  66: ['ठंडी बारिश', '🌧️'],
  67: ['ठंडी बारिश', '🌧️'],
  71: ['हल्की बर्फ़', '🌨️'],
  73: ['बर्फ़बारी', '🌨️'],
  75: ['भारी बर्फ़बारी', '❄️'],
  77: ['बर्फ़ के कण', '🌨️'],
  80: ['हल्की बौछारें', '🌦️'],
  81: ['बौछारें', '🌧️'],
  82: ['तेज़ बौछारें', '⛈️'],
  85: ['बर्फ़ की बौछार', '🌨️'],
  86: ['बर्फ़ की बौछार', '🌨️'],
  95: ['आंधी-तूफ़ान', '⛈️'],
  96: ['ओलों के साथ तूफ़ान', '⛈️'],
  99: ['ओलों के साथ तूफ़ान', '⛈️'],
};

export function describeWeather(code) {
  const hit = WMO[code];
  return { label: hit ? hit[0] : 'मौसम की जानकारी', icon: hit ? hit[1] : '🌡️' };
}

// Open-Meteo only forecasts 16 days ahead, so the puja day can be shown
// only when it is within that window.
export function forecastDaysFor(targetDate, now = new Date()) {
  if (!targetDate) return 7;
  const diff = Math.ceil((targetDate.getTime() - now.getTime()) / 86400000);
  return diff >= 0 && diff < 16 ? 16 : 7;
}

export async function fetchWeather({ lat, lng, days = 7, signal }) {
  const key = `bsp-weather-${lat}-${lng}-${days}`;
  try {
    const cached = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (cached && Date.now() - cached.at < CACHE_MS) return cached.data;
  } catch {
    // ignore storage problems
  }

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'Asia/Kolkata',
    forecast_days: String(days),
  });
  const res = await fetch(`${ENDPOINT}?${params}`, { signal });
  if (!res.ok) throw new Error(`weather ${res.status}`);
  const json = await res.json();
  if (!json || !json.current || !json.daily) throw new Error('weather: bad response');

  const data = {
    current: {
      temp: Math.round(json.current.temperature_2m),
      feelsLike: Math.round(json.current.apparent_temperature),
      humidity: Math.round(json.current.relative_humidity_2m),
      wind: Math.round(json.current.wind_speed_10m),
      code: json.current.weather_code,
    },
    days: json.daily.time.map((date, i) => ({
      date,
      code: json.daily.weather_code[i],
      max: Math.round(json.daily.temperature_2m_max[i]),
      min: Math.round(json.daily.temperature_2m_min[i]),
      rain: json.daily.precipitation_probability_max[i],
    })),
  };
  try {
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // ignore
  }
  return data;
}
