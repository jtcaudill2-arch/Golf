import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../lib/store.jsx';
import { holesForRound, cardTotals, matchState } from '../lib/scoring.js';
import HoleEntry from '../components/HoleEntry.jsx';
import CardGrid from '../components/CardGrid.jsx';
import { RelChip } from '../components/Badge.jsx';

// The signed-in player's own entry screen for whichever round is active.
// Round 1 & 3: personal card. Round 2: the team's scramble card.
export default function MyCard({ me }) {
  const { config, scores, setScore, setConfigKey } = useStore();
  const [round, setRound] = useState(null); // null = follow activeRound
  const activeRound = round ?? config.activeRound ?? 1;
  const [holeNum, setHoleNum] = useState(null);
  const advanceTimer = useRef(null);
  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  const player = config.players.find((p) => p.id === me);
  const myTeam = config.teams.find((t) => t.players.includes(me));
  const holes = useMemo(() => holesForRound(config, activeRound), [config, activeRound]);

  // Whose scores this card edits: my player id, or my team id in the scramble.
  const entity = activeRound === 2 ? myTeam?.id : me;
  const holeScores = scores[activeRound]?.[entity] || {};

  // Handicap context per round.
  const match = activeRound === 3 ? config.round3.matches.find((m) => m.p1 === me || m.p2 === me) : null;
  const matchStrokes = match && match.receiver === me ? match.strokes || 0 : 0;
  const useHandicap = activeRound !== 2;
  const handicap = activeRound === 1 ? player?.handicap || 0 : activeRound === 3 ? matchStrokes : 0;

  const startHole = activeRound === 1 ? config.round1.startHoles?.[me] || 1 : 1;
  const current = holeNum ?? firstOpenHole(holes, holeScores, startHole);
  const hole = holes.find((h) => h.hole === current) || holes[0];
  const totals = cardTotals(holes, holeScores, handicap);

  const soloId = config.round1.soloTeams?.[myTeam?.id];
  const mst = match ? matchState(config, scores, match) : null;
  const opponent = match ? config.players.find((p) => p.id === (match.p1 === me ? match.p2 : match.p1)) : null;

  if (!player) return <div className="screen pad">Pick who you are in Settings.</div>;
  if (activeRound === 2 && !myTeam) return <div className="screen pad">You're not on a team — set teams in Settings.</div>;
  if (!hole) return <div className="screen pad">No holes configured for this round — check the course setup in Settings.</div>;

  return (
    <div className="screen">
      <div className="card-topbar">
        <div className="round-tabs">
          {[1, 2, 3].map((r) => (
            <button
              key={r}
              className={`round-tab ${activeRound === r ? 'on' : ''}`}
              onClick={() => { setRound(r); setHoleNum(null); }}
            >
              R{r}
              {config.activeRound === r && <span className="live-dot" />}
            </button>
          ))}
        </div>
        <div className="card-owner">
          {activeRound === 2 ? `${myTeam.name} · Scramble (gross)` : player.name}
          {activeRound === 1 && ` · HCP ${player.handicap}`}
          {activeRound === 3 && match && ` vs ${opponent?.name}${matchStrokes ? ` · you get ${matchStrokes}` : ''}`}
        </div>
      </div>

      {activeRound === 3 && mst && (
        <div className={`match-banner ${mst.done ? 'match-done' : ''}`}>{mst.status}</div>
      )}

      {activeRound === 1 && myTeam && (
        <label className="solo-toggle">
          <input
            type="checkbox"
            checked={soloId === me}
            onChange={(e) =>
              setConfigKey('round1', (r1) => ({
                ...r1,
                soloTeams: { ...(r1.soloTeams || {}), [myTeam.id]: e.target.checked ? me : undefined },
              }))
            }
          />
          <span>My teammate isn't playing (team score = my gross − avg of our handicaps)</span>
        </label>
      )}

      {activeRound === 1 && startHole > 1 && current < startHole && (
        <div className="notice">You're set to start on hole {startHole} (adjustable in Settings).</div>
      )}

      <HoleEntry
        hole={hole}
        strokes={holeScores[hole.hole] ?? null}
        onChange={(v, advance = false) => {
          setScore(activeRound, entity, hole.hole, v);
          // Pin the view so entering a score never jumps holes unexpectedly;
          // bubble taps advance to the next hole after the reaction plays.
          setHoleNum(hole.hole);
          clearTimeout(advanceTimer.current);
          if (advance && hole.hole < holes.length) {
            advanceTimer.current = setTimeout(() => setHoleNum(hole.hole + 1), 950);
          }
        }}
        handicap={handicap}
        useHandicap={useHandicap}
        onPrev={hole.hole > 1 ? () => setHoleNum(hole.hole - 1) : null}
        onNext={hole.hole < holes.length ? () => setHoleNum(hole.hole + 1) : null}
      />

      <CardGrid
        holes={holes.slice(0, 9)}
        holeScores={holeScores}
        handicap={handicap}
        useHandicap={useHandicap}
        currentHole={hole.hole}
        onSelectHole={setHoleNum}
        disabledBefore={startHole}
      />
      <CardGrid
        holes={holes.slice(9)}
        holeScores={holeScores}
        handicap={handicap}
        useHandicap={useHandicap}
        currentHole={hole.hole}
        onSelectHole={setHoleNum}
        disabledBefore={startHole}
      />

      <div className="totals-bar">
        <div className="tot">
          <div className="tot-label">GROSS</div>
          <div className="tot-value">{totals.played ? totals.gross : '–'}</div>
        </div>
        <div className="tot">
          <div className="tot-label">TO PAR</div>
          <div className="tot-value">{totals.played ? <RelChip diff={totals.toPar} /> : '–'}</div>
        </div>
        {useHandicap && (
          <div className="tot">
            <div className="tot-label">NET</div>
            <div className="tot-value">
              {totals.played ? (
                activeRound === 1 ? totals.gross - handicap : <RelChip diff={totals.netToPar} />
              ) : '–'}
            </div>
          </div>
        )}
        <div className="tot">
          <div className="tot-label">THRU</div>
          <div className="tot-value">{totals.played}</div>
        </div>
      </div>
    </div>
  );
}

function firstOpenHole(holes, holeScores, startHole) {
  for (const h of holes) {
    if (h.hole < startHole) continue;
    if (holeScores[h.hole] == null) return h.hole;
  }
  return holes[holes.length - 1]?.hole ?? 1;
}
