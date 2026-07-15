import React, { useEffect, useRef, useState } from 'react';
import { WeatherIcon, RefreshIcon } from './WeatherIcons.jsx';

const LAT = 35.687;
const LON = -105.9378;
const REFRESH_MS = 20 * 60 * 1000; // 20 minutes

// WMO weather codes -> plain-English label + icon key.
const WEATHER = {
  0: { label: 'Clear sky', icon: 'sun' },
  1: { label: 'Mostly clear', icon: 'sun' },
  2: { label: 'Partly cloudy', icon: 'cloud-sun' },
  3: { label: 'Overcast', icon: 'cloud' },
  45: { label: 'Fog', icon: 'fog' },
  48: { label: 'Freezing fog', icon: 'fog' },
  51: { label: 'Light drizzle', icon: 'rain' },
  53: { label: 'Drizzle', icon: 'rain' },
  55: { label: 'Heavy drizzle', icon: 'rain' },
  56: { label: 'Freezing drizzle', icon: 'rain' },
  57: { label: 'Freezing drizzle', icon: 'rain' },
  61: { label: 'Light rain', icon: 'rain' },
  63: { label: 'Rain', icon: 'rain' },
  65: { label: 'Heavy rain', icon: 'rain' },
  66: { label: 'Freezing rain', icon: 'rain' },
  67: { label: 'Freezing rain', icon: 'rain' },
  71: { label: 'Light snow', icon: 'snow' },
  73: { label: 'Snow', icon: 'snow' },
  75: { label: 'Heavy snow', icon: 'snow' },
  77: { label: 'Snow grains', icon: 'snow' },
  80: { label: 'Light showers', icon: 'rain' },
  81: { label: 'Showers', icon: 'rain' },
  82: { label: 'Heavy showers', icon: 'rain' },
  85: { label: 'Snow showers', icon: 'snow' },
  86: { label: 'Heavy snow showers', icon: 'snow' },
  95: { label: 'Thunderstorm', icon: 'storm' },
  96: { label: 'Thunderstorm, hail', icon: 'storm' },
  99: { label: 'Thunderstorm, hail', icon: 'storm' },
};
function describeCode(code) {
  return WEATHER[code] || { label: 'Unsettled', icon: 'cloud' };
}

const URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m` +
  `&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph` +
  `&timezone=America%2FDenver&forecast_days=1`;

export default function Weather() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  const load = async () => {
    setStatus((s) => (s === 'ok' ? 'ok' : 'loading'));
    try {
      const res = await fetch(URL);
      if (!res.ok) throw new Error('bad response');
      const json = await res.json();
      setData({
        temp: Math.round(json.current.temperature_2m),
        feelsLike: Math.round(json.current.apparent_temperature),
        humidity: Math.round(json.current.relative_humidity_2m),
        wind: Math.round(json.current.wind_speed_10m),
        code: json.current.weather_code,
        hi: Math.round(json.daily.temperature_2m_max[0]),
        lo: Math.round(json.daily.temperature_2m_min[0]),
        at: Date.now(),
      });
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, REFRESH_MS);
    return () => clearInterval(timerRef.current);
  }, []);

  const { label, icon } = data ? describeCode(data.code) : { label: '', icon: 'cloud' };

  return (
    <div className="weather">
      <button className="weather-pill" onClick={() => setOpen((o) => !o)} aria-label="Santa Fe weather">
        <WeatherIcon name={icon} />
        <span className="weather-temp">
          {status === 'ok' ? `${data.temp}°` : status === 'error' ? '—°' : '···'}
        </span>
      </button>
      {open && (
        <>
          <div className="weather-scrim" onClick={() => setOpen(false)} />
          <div className="weather-detail">
            {status === 'error' ? (
              <>
                <div className="weather-detail-title">Can't reach the forecast</div>
                <button className="weather-retry" onClick={load}>Try again</button>
              </>
            ) : (
              <>
                <div className="weather-detail-head">
                  <WeatherIcon name={icon} size={28} />
                  <div>
                    <div className="weather-detail-temp">{data ? `${data.temp}°F` : '···'}</div>
                    <div className="weather-detail-label">{label || 'Loading…'}</div>
                  </div>
                </div>
                {data && (
                  <div className="weather-detail-grid">
                    <span>Feels like {data.feelsLike}°</span>
                    <span>H {data.hi}° · L {data.lo}°</span>
                    <span>Wind {data.wind} mph</span>
                    <span>Humidity {data.humidity}%</span>
                  </div>
                )}
                <div className="weather-detail-foot">
                  <span>Santa Fe, NM{data ? ` · updated ${minutesAgo(data.at)}` : ''}</span>
                  <button className="weather-refresh" onClick={load} aria-label="Refresh">
                    <RefreshIcon />
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function minutesAgo(ts) {
  const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (m < 1) return 'just now';
  if (m === 1) return '1 min ago';
  return `${m} min ago`;
}
