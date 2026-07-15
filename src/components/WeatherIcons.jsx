import React from 'react';

// Weather glyphs — filled silhouettes (so overlapping cloud shapes merge
// cleanly) matching the same restrained, single-color line-icon language as
// the bottom nav. No third-party icon set, no emoji.
const cloudLobes = (
  <>
    <circle cx="9.5" cy="9" r="3.2" />
    <circle cx="14.5" cy="7.9" r="3.8" />
    <rect x="5.8" y="10" width="13" height="5" rx="2.5" />
  </>
);

export function SunIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <line x1="12" y1="3" x2="12" y2="5.3" />
        <line x1="12" y1="18.7" x2="12" y2="21" />
        <line x1="3" y1="12" x2="5.3" y2="12" />
        <line x1="18.7" y1="12" x2="21" y2="12" />
        <line x1="5.5" y1="5.5" x2="7.1" y2="7.1" />
        <line x1="16.9" y1="16.9" x2="18.5" y2="18.5" />
        <line x1="5.5" y1="18.5" x2="7.1" y2="16.9" />
        <line x1="16.9" y1="7.1" x2="18.5" y2="5.5" />
      </g>
    </svg>
  );
}

export function CloudSunIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="8.2" cy="7.6" r="2.8" />
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <line x1="8.2" y1="2" x2="8.2" y2="3.4" />
        <line x1="3" y1="7.6" x2="4.4" y2="7.6" />
        <line x1="4.5" y1="3.9" x2="5.5" y2="4.9" />
        <line x1="11.9" y1="3.9" x2="10.9" y2="4.9" />
      </g>
      <circle cx="12" cy="13.5" r="3.3" />
      <circle cx="16.5" cy="12.5" r="4" />
      <rect x="8.7" y="14.5" width="12" height="5" rx="2.5" />
    </svg>
  );
}

export function CloudIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="9.5" cy="11" r="3.6" />
      <circle cx="15" cy="9.8" r="4.3" />
      <rect x="5.5" y="12.2" width="14" height="5.6" rx="2.8" />
    </svg>
  );
}

export function FogIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <g fill="currentColor">
        <circle cx="9.5" cy="7.3" r="2.5" />
        <circle cx="14" cy="6.5" r="3" />
        <rect x="6.3" y="8.3" width="11.5" height="3.8" rx="1.9" />
      </g>
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <line x1="4.5" y1="15.5" x2="19.5" y2="15.5" />
        <line x1="6" y1="18.7" x2="18" y2="18.7" />
      </g>
    </svg>
  );
}

export function RainIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <g fill="currentColor">{cloudLobes}</g>
      <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <line x1="9" y1="17.3" x2="8" y2="20.2" />
        <line x1="13" y1="17.3" x2="12" y2="20.2" />
        <line x1="17" y1="17.3" x2="16" y2="20.2" />
      </g>
    </svg>
  );
}

export function SnowIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <g fill="currentColor">
        {cloudLobes}
        <circle cx="8.5" cy="19" r="1.15" />
        <circle cx="13" cy="20" r="1.15" />
        <circle cx="16.5" cy="18.4" r="1.15" />
      </g>
    </svg>
  );
}

export function StormIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {cloudLobes}
      <path d="M13.3 15.3 L9.6 19.8 L12 19.8 L10.6 23.5 L15.2 18.2 L12.7 18.2 Z" />
    </svg>
  );
}

export function RefreshIcon({ size = 15 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 11A8 8 0 1 0 18.4 16" />
      <polyline points="20 5 20 11 14 11" />
    </svg>
  );
}

export const WEATHER_ICONS = {
  sun: SunIcon,
  'cloud-sun': CloudSunIcon,
  cloud: CloudIcon,
  fog: FogIcon,
  rain: RainIcon,
  snow: SnowIcon,
  storm: StormIcon,
};

export function WeatherIcon({ name, size }) {
  const Cmp = WEATHER_ICONS[name] || CloudIcon;
  return <Cmp size={size} />;
}
