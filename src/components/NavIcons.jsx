import React from 'react';

// A matched set of minimal line icons for the bottom nav — single stroke
// weight, round caps, currentColor — so they inherit the active/inactive
// tab color automatically and read as one family instead of a mismatched
// pile of dingbats and emoji.
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
};

export function LiveIcon() {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="7.4" />
      <circle cx="12" cy="12" r="2.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CardIcon() {
  return (
    <svg {...base}>
      <rect x="4.5" y="3.5" width="15" height="17" rx="2.5" />
      <path d="M8.4 12.6l2.3 2.3L16 9.4" />
    </svg>
  );
}

export function RoundsIcon() {
  return (
    <svg {...base}>
      <line x1="7" y1="4" x2="7" y2="20" />
      <path d="M7 4.5 L16 7.5 L7 10.5 Z" fill="currentColor" stroke="none" />
      <ellipse cx="7" cy="20.3" rx="4" ry="1.1" />
    </svg>
  );
}

export function ScoringIcon() {
  return (
    <svg {...base}>
      <rect x="4.6" y="14" width="3.3" height="6" rx="1" fill="currentColor" stroke="none" />
      <rect x="10.35" y="9.5" width="3.3" height="10.5" rx="1" fill="currentColor" stroke="none" />
      <rect x="16.1" y="5" width="3.3" height="15" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function RulesIcon() {
  return (
    <svg {...base}>
      <rect x="5" y="3.5" width="14" height="17" rx="2" />
      <line x1="8" y1="8.5" x2="16" y2="8.5" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="15.5" x2="13" y2="15.5" />
    </svg>
  );
}

export function SetupIcon() {
  return (
    <svg {...base}>
      <line x1="4.5" y1="7" x2="19.5" y2="7" />
      <circle cx="14" cy="7" r="1.7" fill="currentColor" stroke="none" />
      <line x1="4.5" y1="12" x2="19.5" y2="12" />
      <circle cx="9" cy="12" r="1.7" fill="currentColor" stroke="none" />
      <line x1="4.5" y1="17" x2="19.5" y2="17" />
      <circle cx="16" cy="17" r="1.7" fill="currentColor" stroke="none" />
    </svg>
  );
}
