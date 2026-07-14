import React, { useEffect, useRef, useState } from 'react';
import { ScoreBadge, RelChip } from './Badge.jsx';
import { strokesOnHole } from '../lib/scoring.js';

// Focused entry card for one hole: big par/SI header, tappable score
// bubbles plus a +/- stepper, gross badge and net result. Entering a score
// fires a reaction that scales with how far above or below par it is —
// confetti bursts under par, escalating shakes over par.
export default function HoleEntry({
  hole,            // { hole, par, si, effSi, nineName, nineHole, name }
  strokes,
  onChange,
  handicap = 0,
  useHandicap = true,
  onPrev,
  onNext,
}) {
  const dots = useHandicap ? strokesOnHole(handicap, hole.effSi) : 0;
  const net = strokes != null ? strokes - dots - hole.par : null;
  // House rules: triple bogey max — pick it up.
  const maxScore = hole.par + 3;
  const bubbles = Array.from({ length: maxScore }, (_, i) => i + 1);

  const [reaction, setReaction] = useState(null);
  const seq = useRef(0);
  const fire = (val) => {
    if (val == null) return;
    seq.current += 1;
    setReaction({ id: seq.current, diff: val - hole.par });
  };
  // Moving to another hole clears any in-flight reaction.
  useEffect(() => setReaction(null), [hole.hole]);

  const shake =
    reaction && reaction.diff > 0 ? `shake-${Math.min(3, reaction.diff)}` : '';

  return (
    <div className={`hole-entry card ${shake}`}>
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
          {hole.name && <div className="he-holename">“{hole.name}”</div>}
        </div>
        <button className="he-arrow" onClick={onNext} disabled={!onNext} aria-label="Next hole">›</button>
      </div>


      <div className="he-bubbles">
        {bubbles.map((n) => (
          <button
            key={n}
            className={`bubble ${strokes === n ? 'bubble-on' : ''}`}
            onClick={() => {
              const next = strokes === n ? null : n;
              fire(next);
              onChange(next, next != null); // bubble entry advances to the next hole
            }}
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
            onClick={() => {
              const next = strokes == null ? hole.par : Math.min(maxScore, strokes + 1);
              fire(next);
              onChange(next);
            }}
            disabled={strokes != null && strokes >= maxScore}
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
      {strokes === maxScore && <div className="he-max">TRIPLE MAX — PICK IT UP</div>}

      {reaction && (
        <Reaction key={reaction.id} diff={reaction.diff} onDone={() => setReaction(null)} />
      )}
    </div>
  );
}

const LABELS = {
  '-3': 'ALBATROSS!', '-2': 'EAGLE!', '-1': 'BIRDIE!',
  0: 'PAR', 1: 'BOGEY', 2: 'DOUBLE BOGEY', 3: 'TRIPLE — OUCH',
};

// One-shot celebration/commiseration overlay; intensity scales with |diff|.
function Reaction({ diff, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1150);
    return () => clearTimeout(t);
  }, [onDone]);

  const mag = Math.min(3, Math.abs(diff));
  const label = LABELS[String(Math.max(-3, Math.min(3, diff)))];
  // Generated once per reaction (the component is remounted per reaction via
  // key), so re-renders from realtime events can't re-randomize mid-flight.
  const [particles] = useState(() => {
    if (diff >= 0) return [];
    const colors = ['#d9b24a', '#37b3a8', '#e9e1d1'];
    return Array.from({ length: 14 * mag }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * (50 + 35 * mag);
      return {
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        color: colors[i % colors.length],
        delay: Math.random() * 0.18,
        size: 5 + Math.random() * 4,
      };
    });
  });

  return (
    <div className="reaction-layer" aria-hidden="true">
      {diff > 0 && <div className={`vignette-bad vignette-${mag}`} />}
      {particles.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            background: p.color,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
          }}
        />
      ))}
      <div
        className={`reaction-label ${
          diff < 0 ? 'reaction-good' : diff > 0 ? 'reaction-bad' : 'reaction-par'
        } tier-${mag}`}
      >
        {label}
      </div>
    </div>
  );
}
