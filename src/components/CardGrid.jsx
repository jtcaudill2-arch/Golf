import React from 'react';
import { ScoreBadge } from './Badge.jsx';
import { strokesOnHole, relText } from '../lib/scoring.js';

// Classic scorecard strip: front nine and back nine tables with hole, par,
// gross badge and net rows. Tapping a hole column selects it for entry.
// Stroke dots under the hole number mark holes where the player receives
// handicap strokes.
export default function CardGrid({
  holes,
  holeScores,
  handicap = 0,
  useHandicap = true,
  currentHole,
  onSelectHole,
  disabledBefore = 1,
}) {
  const slice = holes;
  return (
    <div className="cardgrid-scroll">
      <table className="cardgrid">
        <tbody>
          <tr className="cg-hole">
            {slice.map((h) => {
              const dots = useHandicap ? strokesOnHole(handicap, h.effSi) : 0;
              const disabled = h.hole < disabledBefore;
              return (
                <td
                  key={h.hole}
                  className={`${currentHole === h.hole ? 'cg-current' : ''} ${disabled ? 'cg-disabled' : ''}`}
                  onClick={() => !disabled && onSelectHole?.(h.hole)}
                >
                  <div className="cg-num">{h.hole}</div>
                  <div className="cg-dots">
                    {Array.from({ length: dots }).map((_, i) => (
                      <span key={i} className="stroke-dot" />
                    ))}
                  </div>
                </td>
              );
            })}
            <td className="cg-total-label">
              <div className="cg-num">TOT</div>
            </td>
          </tr>
          <tr className="cg-yds">
            {slice.map((h) => (
              <td key={h.hole}>{h.yds || '–'}</td>
            ))}
            <td>{slice.some((h) => h.yds) ? slice.reduce((s, h) => s + (h.yds || 0), 0) : '–'}</td>
          </tr>
          <tr className="cg-par">
            {slice.map((h) => (
              <td key={h.hole}>{h.par}</td>
            ))}
            <td>{slice.reduce((s, h) => s + h.par, 0)}</td>
          </tr>
          <tr className="cg-score">
            {slice.map((h) => {
              const disabled = h.hole < disabledBefore;
              return (
                <td
                  key={h.hole}
                  className={`${currentHole === h.hole ? 'cg-current' : ''} ${disabled ? 'cg-disabled' : ''}`}
                  onClick={() => !disabled && onSelectHole?.(h.hole)}
                >
                  <ScoreBadge strokes={holeScores?.[h.hole]} par={h.par} size="sm" />
                </td>
              );
            })}
            <td className="cg-total">
              {slice.reduce((s, h) => s + (holeScores?.[h.hole] ?? 0), 0) || '–'}
            </td>
          </tr>
          {useHandicap && (
            <tr className="cg-net">
              {slice.map((h) => {
                const s = holeScores?.[h.hole];
                if (s == null) return <td key={h.hole}>·</td>;
                const net = s - strokesOnHole(handicap, h.effSi) - h.par;
                return (
                  <td key={h.hole} className={net < 0 ? 'net-under' : net > 0 ? 'net-over' : 'net-even'}>
                    {relText(net)}
                  </td>
                );
              })}
              <td>net</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
