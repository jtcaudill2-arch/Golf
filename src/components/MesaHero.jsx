import React from 'react';

// Layered dusk panorama: glowing Zia sun over stacked mesa silhouettes with
// atmospheric depth. Pure SVG gradients — no image assets to load.
export default function MesaHero({ children }) {
  return (
    <div className="mesa-hero">
      <svg
        className="mesa-svg"
        viewBox="0 0 400 170"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#13161a" />
            <stop offset="45%" stopColor="#232030" />
            <stop offset="72%" stopColor="#6e3f3a" />
            <stop offset="92%" stopColor="#c1663f" />
            <stop offset="100%" stopColor="#d9b24a" />
          </linearGradient>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d9b24a" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#d9b24a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#d9b24a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="mesaFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c4a44" />
            <stop offset="100%" stopColor="#5c3a3e" />
          </linearGradient>
          <linearGradient id="mesaMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#54333c" />
            <stop offset="100%" stopColor="#37262f" />
          </linearGradient>
          <linearGradient id="mesaNear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a1e26" />
            <stop offset="100%" stopColor="#171319" />
          </linearGradient>
        </defs>

        <rect width="400" height="170" fill="url(#sky)" />

        {/* stars */}
        <g fill="#e9e1d1" opacity="0.7">
          <circle cx="38" cy="22" r="1" />
          <circle cx="90" cy="14" r="0.7" />
          <circle cx="150" cy="30" r="0.8" />
          <circle cx="228" cy="12" r="1" />
          <circle cx="312" cy="24" r="0.7" />
          <circle cx="366" cy="40" r="0.9" />
          <circle cx="262" cy="38" r="0.6" />
        </g>

        {/* sun with zia rays */}
        <circle cx="300" cy="86" r="52" fill="url(#sunGlow)" />
        <g stroke="#d9b24a" strokeWidth="2.6" strokeLinecap="round" opacity="0.95">
          <circle cx="300" cy="86" r="15" fill="#d9b24a" stroke="none" />
          <g>
            <line x1="295" y1="62" x2="295" y2="52" />
            <line x1="300" y1="60" x2="300" y2="46" />
            <line x1="305" y1="62" x2="305" y2="52" />
          </g>
          <g transform="rotate(90 300 86)">
            <line x1="295" y1="62" x2="295" y2="52" />
            <line x1="300" y1="60" x2="300" y2="46" />
            <line x1="305" y1="62" x2="305" y2="52" />
          </g>
          <g transform="rotate(180 300 86)">
            <line x1="295" y1="62" x2="295" y2="52" />
            <line x1="300" y1="60" x2="300" y2="46" />
            <line x1="305" y1="62" x2="305" y2="52" />
          </g>
          <g transform="rotate(270 300 86)">
            <line x1="295" y1="62" x2="295" y2="52" />
            <line x1="300" y1="60" x2="300" y2="46" />
            <line x1="305" y1="62" x2="305" y2="52" />
          </g>
        </g>

        {/* far mesa band */}
        <path
          d="M0 118 L30 118 L38 104 L92 104 L100 118 L150 118 L160 100 L214 100 L222 118 L400 118 L400 170 L0 170 Z"
          fill="url(#mesaFar)"
          opacity="0.85"
        />
        {/* mid mesa band */}
        <path
          d="M0 136 L52 136 L62 118 L128 118 L138 136 L232 136 L244 114 L308 114 L318 136 L400 136 L400 170 L0 170 Z"
          fill="url(#mesaMid)"
        />
        {/* near ridge */}
        <path
          d="M0 170 L0 152 L70 148 L140 156 L212 146 L290 156 L356 148 L400 154 L400 170 Z"
          fill="url(#mesaNear)"
        />
      </svg>
      <div className="mesa-content">{children}</div>
    </div>
  );
}
