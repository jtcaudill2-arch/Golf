import React, { useEffect, useRef, useState } from 'react';
import { ScoreBadge, RelChip } from './Badge.jsx';
import { strokesOnHole, ordinalWord } from '../lib/scoring.js';

// Focused entry card for one hole: big par/SI header, tappable score
// bubbles plus a +/- stepper, gross badge and net result. Entering a score
// fires a reaction that scales with how far above or below par it is —
// confetti bursts under par, escalating shakes over par. The pick-up cap
// (maxOverPar) is per-round, e.g. Round 1 runs a quadruple bogey max while
// the others run triple.
export default function HoleEntry({
  hole,            // { hole, par, si, effSi, nineName, nineHole, name }
  strokes,
  onChange,
  handicap = 0,
  useHandicap = true,
  maxOverPar = 3,
  onPrev,
  onNext,
}) {
  const dots = useHandicap ? strokesOnHole(handicap, hole.effSi) : 0;
  const net = strokes != null ? strokes - dots - hole.par : null;
  const maxScore = hole.par + maxOverPar;
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
      {strokes === maxScore && (
        <div className="he-max">{ordinalWord(maxOverPar).toUpperCase()} MAX — PICK IT UP</div>
      )}

      {reaction && (
        <Reaction key={reaction.id} diff={reaction.diff} maxOverPar={maxOverPar} onDone={() => setReaction(null)} />
      )}
    </div>
  );
}

const UNDER_PAR_LABELS = { '-3': 'ALBATROSS!', '-2': 'EAGLE!', '-1': 'BIRDIE!' };

// Label for a score's distance from par, aware of the round's pick-up cap
// (e.g. +3 reads "TRIPLE — OUCH" when the cap is 3, but "TRIPLE BOGEY" when
// a looser round lets you keep going to +4).
function labelFor(diff, maxOverPar) {
  if (diff === 0) return 'PAR';
  if (diff < 0) return UNDER_PAR_LABELS[String(Math.max(-3, diff))] ?? UNDER_PAR_LABELS['-3'];
  const word = ordinalWord(diff).toUpperCase();
  if (diff === maxOverPar) return `${word} — OUCH`;
  return diff === 1 ? 'BOGEY' : `${word} BOGEY`;
}

// One-shot celebration/commiseration overlay; intensity scales with |diff|.
function Reaction({ diff, maxOverPar, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1150);
    return () => clearTimeout(t);
  }, [onDone]);

  const mag = Math.min(3, Math.abs(diff));
  const label = labelFor(diff, maxOverPar);
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
