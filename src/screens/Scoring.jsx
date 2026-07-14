import React from 'react';
import { useStore } from '../lib/store.jsx';
import { ordinalWord, fmtPts, matchHandicapStrokes } from '../lib/scoring.js';
import Zia from '../components/Zia.jsx';

// A plain-English breakdown of every scoring rule in the app. Every number
// shown here — points tables, pick-up caps, today's match strokes — is read
// live from config, so this page can never drift out of sync with how the
// app actually scores things. Change a points table in Settings and this
// page reflects it immediately, on every phone.
export default function Scoring() {
  const { config } = useStore();
  const { players } = config;
  const lowHcp = players.reduce((a, b) => (b.handicap < a.handicap ? b : a), players[0]);
  const highHcp = players.reduce((a, b) => (b.handicap > a.handicap ? b : a), players[0]);

  return (
    <div className="screen">
      <div className="hero">
        <Zia size={36} />
        <h1 className="hero-title">HOW SCORING WORKS</h1>
      </div>
      <div className="fine-print">
        Every number on this page is live — change a points table, a max score, or a handicap
        in Settings and this updates instantly, same as everywhere else in the app.
      </div>

      <Card title="Handicap strokes">
        <p>
          Your handicap becomes strokes taken off your gross score, one at a time, starting on
          the hardest hole (lowest stroke index) and working down. Handicaps above 18 wrap
          around — you get a second stroke on the hardest holes once your first pass covers
          all 18.
        </p>
        <ExampleRow player={lowHcp} />
        {highHcp.id !== lowHcp.id && <ExampleRow player={highHcp} />}
        <p className="fine-print">
          On your scorecard, a gold dot under the hole number marks where you get a stroke, and
          your "net" for that hole already has it subtracted. Add up all 18 holes and it's the
          same as gross minus your full handicap — that total is what's used for ranking.
        </p>
      </Card>

      <Card title="Round 1 — Individual net (Paako Ridge)">
        <p>
          Every player plays their own ball. <b>Net score = 18-hole gross total − your full
          handicap.</b> Lowest net wins the round.
        </p>
        <h3 className="mini-title">Points by net finish</h3>
        <RankChips values={config.round1.points} />
        <p className="fine-print">Tied finishes split the points between them (e.g. two tied for 1st share 1st + 2nd's points).</p>

        <h3 className="mini-title">Max score per hole</h3>
        <p>
          {ordinalWord(config.round1.maxOverPar)} bogey max — once your gross score on a hole
          hits par + {config.round1.maxOverPar}, pick up. The app won't let you enter anything
          higher.
        </p>

        <h3 className="mini-title">Round 1 team score</h3>
        <p>
          Separate from individual points: each team's Round 1 score is normally the{' '}
          <b>better (lower) net</b> of the two teammates. If a team flags "my teammate isn't
          playing," that team's score instead becomes{' '}
          <b>the solo player's gross minus the average of both teammates' handicaps</b> (not
          the solo player's own handicap).
        </p>
        <p className="fine-print">
          Example: if one teammate is a 12 and the other a 28, and the 12 plays alone shooting an
          88, the team score is 88 − 20 (the average) = 68.
        </p>
        <p>
          This shows on its own "Round 1 · Team" card, separate from the individual leaderboard.
          {config.round1.teamBonusEnabled ? (
            <> It also adds bonus points to the overall standings, by finish:</>
          ) : (
            <> Bonus points into the overall standings are currently <b>off</b> (toggle it in Settings).</>
          )}
        </p>
        {config.round1.teamBonusEnabled && <RankChips values={config.round1.teamPoints || []} />}
      </Card>

      <Card title="Round 2 — 2-man scramble (Paako Ridge)">
        <p>
          Both partners tee off, pick the better shot, and play from there together — repeat
          until it's holed. <b>One gross score per team per hole, no handicap.</b> Straight
          lowest-gross-total wins.
        </p>
        <h3 className="mini-title">Points by gross finish</h3>
        <RankChips values={config.round2.points} />
        <p className="fine-print">Both players on the team earn these points — it counts twice toward the overall standings.</p>
        <h3 className="mini-title">Max score per hole</h3>
        <p>
          {ordinalWord(config.round2.maxOverPar)} bogey max, same rule as the other rounds — just
          applied to the team's one shared score.
        </p>
      </Card>

      <Card title="Round 3 — Match play (Black Mesa)">
        <p>
          Head to head, hole by hole. Win a hole = 1 up; the match is decided by who's ahead
          when there aren't enough holes left to catch up — a "3&amp;2" win means 3 up with 2
          holes left. A match still level after 18 holes is halved ("AS").
        </p>
        <h3 className="mini-title">Strokes given</h3>
        <p>
          The higher-handicap player in each match receives the full difference between the two
          players' current handicaps, allocated to the hardest holes by stroke index — same
          allocation rule as Round 1. This <b>recalculates automatically</b> the moment either
          player's handicap changes; only the matchup (who plays whom) is fixed.
        </p>
        <h3 className="mini-title">Today's matchups</h3>
        <div className="stat-card-inline">
          {config.round3.matches.map((m) => {
            const p1 = players.find((p) => p.id === m.p1);
            const p2 = players.find((p) => p.id === m.p2);
            const hs = matchHandicapStrokes(config, m);
            const recv = hs.receiver ? players.find((p) => p.id === hs.receiver) : null;
            return (
              <div key={m.id} className="stat-row">
                <span className="stat-name">{p1?.name} vs {p2?.name}</span>
                <span className="stat-value">{hs.strokes > 0 ? `${recv?.name} +${hs.strokes}` : 'even'}</span>
              </div>
            );
          })}
        </div>
        <h3 className="mini-title">Points</h3>
        <div className="chip-row">
          <div className="chip">Win — {fmtPts(config.round3.winPoints)} pts</div>
          <div className="chip">Halve — {fmtPts(config.round3.halvePoints)} pts each</div>
          <div className="chip">Loss — 0 pts</div>
        </div>
        <p className="fine-print">Win/loss points go to that player individually, not split with their partner.</p>
        <h3 className="mini-title">Max score per hole</h3>
        <p>{ordinalWord(config.round3.maxOverPar)} bogey max, same rule as the other rounds.</p>
      </Card>

      <Card title="Overall standings">
        <p>
          Each player earns points from Round 1 (individual net) and Round 3 (match play), plus
          their team earns Round 2 (scramble) points shared by both partners
          {config.round1.teamBonusEnabled ? ', plus the Round 1 team bonus' : ''}. On the Live
          tab, a <b>team's total is both players' points added together</b> — that's what
          decides the Cup.
        </p>
        <p className="fine-print">
          Rounds still in progress show projected points: whoever's currently leading a match or
          net standings is treated as the winner until it's actually finished.
        </p>
      </Card>

      <div className="fine-print">
        For hazard drops, gimmes, and other on-course rules, see the Rules tab. Every number
        above is adjustable in Settings.
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="card scoring-card">
      <h2 className="section-title scoring-card-title">{title.toUpperCase()}</h2>
      {children}
    </div>
  );
}

function ExampleRow({ player }) {
  return (
    <p>
      <b>{player.name}</b> (HCP {player.handicap}) {describeHandicap(player.handicap)}
    </p>
  );
}

function describeHandicap(hcp) {
  const full = Math.floor(hcp / 18);
  const rem = hcp % 18;
  if (hcp === 0) return 'gets no strokes — plays every hole straight up.';
  if (rem === 0) return `gets ${full} stroke${full > 1 ? 's' : ''} on every hole.`;
  const hardest = `the hardest ${rem} hole${rem > 1 ? 's' : ''} (stroke index 1–${rem})`;
  if (full === 0) return `gets 1 stroke on ${hardest}, and none on the rest.`;
  return `gets ${full + 1} strokes on ${hardest}, and ${full} on the other ${18 - rem} holes.`;
}

function RankChips({ values }) {
  return (
    <div className="chip-row">
      {values.map((v, i) => (
        <div key={i} className="chip">{ordinal(i + 1)} — {fmtPts(v)} pts</div>
      ))}
    </div>
  );
}

function ordinal(n) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}
