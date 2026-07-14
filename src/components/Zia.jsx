import React from 'react';

// Zia sun: four groups of four rays radiating from a circle.
export default function Zia({ size = 24, color = '#d9b24a', spin = false, className = '' }) {
  const group = (transform) => (
    <g transform={transform}>
      <line x1="-15" y1="-34" x2="-15" y2="-52" />
      <line x1="-5" y1="-36" x2="-5" y2="-60" />
      <line x1="5" y1="-36" x2="5" y2="-60" />
      <line x1="15" y1="-34" x2="15" y2="-52" />
    </g>
  );
  return (
    <svg
      viewBox="-64 -64 128 128"
      width={size}
      height={size}
      className={`zia ${spin ? 'zia-spin' : ''} ${className}`}
      aria-hidden="true"
    >
      <g stroke={color} strokeWidth="9" strokeLinecap="round" fill="none">
        <circle r="22" fill={color} stroke="none" />
        {group('')}
        {group('rotate(90)')}
        {group('rotate(180)')}
        {group('rotate(270)')}
      </g>
    </svg>
  );
}
