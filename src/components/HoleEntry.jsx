import React from 'react';
import { ScoreBadge, RelChip } from './Badge.jsx';
import { strokesOnHole } from '../lib/scoring.js';

// Focused entry card for one hole: big par/SI header, tappable score
// bubbles plus a +/- stepper, gross badge and net result.
export default function HoleEntry({
  hole,            // { hole, par, si, effSi, nineName, nineHole }
  strokes,
  onChange,
  handicap = 0,
  useHandicap = true,
  onPrev,
  onNext,
  banner = null,
}) {
  const dots = useHandicap ? strokesOnHole(handicap, hole.effSi) : 0;
  const net = strokes != null ? strokes - dots - hole.par : null;
  const maxBubble = Math.max(hole.par + 4, 9);
  const bubbles = Array.from({ length: maxBubble }, (_, i) => i + 1);

  return (
    <div className="hole-entry card">
      <div className="he-header">
        <button className="he-arrow" onClick={onPrev} disabled={!onPrev} aria-label="Previous hole">‹</button>
        <div className="he-title">
          <div className="he-holenum">
            HOLE {hole.hole}
            {dots > 0 && (
              <span className="he-dots">
                {Array.from({ length: dots }).map((_, i) => (
                  <span key={i} className="stroke-dot stroke-dot-lg" />
                ))}
              </span>
            )}
          </div>
          <div className="he-sub">
            PAR {hole.par}
            {hole.yds ? ` · ${hole.yds} YDS` : ''} · HCP {hole.si}
            {hole.nineName ? ` · ${hole.nineName} #${hole.nineHole}` : ''}
          </div>
        </div>
        <button className="he-arrow" onClick={onNext} disabled={!onNext} aria-label="Next hole">›</button>
      </div>

      {banner}

      <div className="he-bubbles">
        {bubbles.map((n) => (
          <button
            key={n}
            className={`bubble ${strokes === n ? 'bubble-on' : ''}`}
            onClick={() => onChange(strokes === n ? null : n)}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="he-row">
        <div className="he-stepper">
          <button
            className="step-btn"
            onClick={() => strokes != null && onChange(strokes <= 1 ? null : strokes - 1)}
            disabled={strokes == null}
          >
            −
          </button>
          <div className="step-value">{strokes ?? '–'}</div>
          <button
            className="step-btn"
            onClick={() => onChange(strokes == null ? hole.par : strokes + 1)}
          >
            +
          </button>
        </div>
        <div className="he-result">
          <div className="he-gross">
            <ScoreBadge strokes={strokes} par={hole.par} size="lg" />
            <RelChip diff={strokes != null ? strokes - hole.par : null} />
          </div>
          {useHandicap && strokes != null && (
            <div className="he-net">
              NET <RelChip diff={net} />
              {dots > 0 && <span className="he-net-note">({dots} stroke{dots > 1 ? 's' : ''})</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
