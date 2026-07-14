import React from 'react';
import { badge, relText } from '../lib/scoring.js';

// Gross score with classic scorecard notation: circle = birdie, double
// circle = eagle+, square = bogey, double square = double bogey or worse.
export function ScoreBadge({ strokes, par, size = 'md' }) {
  if (strokes == null) return <span className={`badge badge-${size} badge-empty`}>–</span>;
  const kind = badge(strokes - par);
  return <span className={`badge badge-${size} badge-${kind}`}>{strokes}</span>;
}

export function RelChip({ diff, prefix = '' }) {
  if (diff == null) return null;
  const cls = diff < 0 ? 'rel-under' : diff > 0 ? 'rel-over' : 'rel-even';
  return (
    <span className={`rel ${cls}`}>
      {prefix}
      {relText(diff)}
    </span>
  );
}
