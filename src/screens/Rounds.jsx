import React, { useState } from 'react';
import { useStore } from '../lib/store.jsx';
import {
  round1Results, round1TeamResults, round2Results, round3Results,
  holesForRound, coursePar,
} from '../lib/scoring.js';
import Zia from '../components/Zia.jsx';
import { RelChip } from '../components/Badge.jsx';

export default function Rounds() {
  const { config } = useStore();
  const [tab, setTab] = useState(config.activeRound ?? 1);
  return (
    <div className="screen">
      <div className="round-tabs round-tabs-wide">
        {[1, 2, 3].map((r) => (
          <button key={r} className={`round-tab ${tab === r ? 'on' : ''}`} onClick={() => setTab(r)}>
            ROUND {r}
          </button>
        ))}
      </div>
      {tab === 1 && <Round1 />}
      {tab === 2 && <Round2 />}
      {tab === 3 && <Round3 />}
    </div>
  );
}

function Round1() {
  const { config, scores } = useStore();
  const { holes, rows } = round1Results(config, scores);
  const team = round1TeamResults(config, scores);
  const groups = config.round1.groups || [];
  const nameOf = (id) => config.players.find((p) => p.id === id)?.name || id;

  return (
    <>
      <RoundHeader title={config.round1.name} holes={holes} />
      <div className="chip-row">
        {groups.map((g, i) => (
          <div key={i} className="chip">G{i + 1}: {g.map(nameOf).join(', ')}</div>
        ))}
      </div>
      <div className="table-wrap card">
        <table className="lb">
          <thead>
            <tr><th></th><th className="lb-name">PLAYER</th><th>THRU</th><th>GROSS</th><th>NET</th><th className="lb-total">PTS</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={r.rank === 1 ? 'lb-leader' : ''}>
                <td className="lb-rank">{r.rank === 1 ? <Zia size={20} /> : r.rank ?? '–'}</td>
                <td className="lb-name">{r.name} <span className="hcp">({r.handicap})</span></td>
                <td>{r.played || '–'}</td>
                <td>{r.played ? r.gross : '–'}</td>
                <td className="lb-strong">{r.net ?? '–'}</td>
                <td className="lb-total">{r.points % 1 ? r.points.toFixed(1) : r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="section-title">ROUND 1 · TEAM</h2>
      <div className="card stat-card">
        {team.map((t) => (
          <div key={t.id} className="stat-row">
            <span className="stat-rank">{t.rank ?? '–'}</span>
            <span className="stat-name">{t.name}<span className="stat-detail">{t.detail}</span></span>
            <span className="stat-value">{t.net != null ? `${t.net % 1 ? t.net.toFixed(1) : t.net} net` : '–'}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Round2() {
  const { config, scores } = useStore();
  const { holes, rows } = round2Results(config, scores);
  const nameOf = (id) => config.players.find((p) => p.id === id)?.name || id;
  const teamName = (id) => config.teams.find((t) => t.id === id)?.name || id;

  return (
    <>
      <RoundHeader title={config.round2.name} holes={holes} />
      <div className="chip-row">
        {(config.round2.matchups || []).map((m, i) => (
          <div key={i} className="chip">{teamName(m[0])} vs {teamName(m[1])}</div>
        ))}
      </div>
      <div className="table-wrap card">
        <table className="lb">
          <thead>
            <tr><th></th><th className="lb-name">TEAM</th><th>THRU</th><th>GROSS</th><th>TO PAR</th><th className="lb-total">PTS</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={r.rank === 1 ? 'lb-leader' : ''}>
                <td className="lb-rank">{r.rank === 1 ? <Zia size={20} /> : r.rank ?? '–'}</td>
                <td className="lb-name">
                  {r.name}
                  <span className="stat-detail">{r.players.map(nameOf).join(' + ')}</span>
                </td>
                <td>{r.played || '–'}</td>
                <td className="lb-strong">{r.gross ?? '–'}</td>
                <td>{r.played ? <RelChip diff={r.toPar} /> : '–'}</td>
                <td className="lb-total">{r.points % 1 ? r.points.toFixed(1) : r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="fine-print">Straight up — no handicaps. Both players on the team earn the points.</div>
    </>
  );
}

function Round3() {
  const { config, scores } = useStore();
  const { matches } = round3Results(config, scores);
  const holes = holesForRound(config, 3);

  return (
    <>
      <RoundHeader title={config.round3.name} holes={holes} />
      {matches.map((m) => (
        <div key={m.id} className="card match-card">
          <div className="match-players">
            <span className={`mp ${m.state.winner === m.p1 ? 'mp-win' : ''}`}>
              {m.state.p1?.name}
              {m.strokes > 0 && m.receiver === m.p1 && <span className="hcp"> +{m.strokes}</span>}
            </span>
            <span className="mp-vs">vs</span>
            <span className={`mp ${m.state.winner === m.p2 ? 'mp-win' : ''}`}>
              {m.state.p2?.name}
              {m.strokes > 0 && m.receiver === m.p2 && <span className="hcp"> +{m.strokes}</span>}
            </span>
          </div>
          {m.strokes > 0 && (
            <div className="fine-print">
              {config.players.find((p) => p.id === m.receiver)?.name} gets {m.strokes} stroke{m.strokes > 1 ? 's' : ''} (hardest {m.strokes} holes)
            </div>
          )}
          <div className={`match-banner ${m.state.done ? 'match-done' : ''}`}>{m.state.status}</div>
          <div className="match-holes">
            {holes.map((h) => {
              const r = m.state.holeResults[h.hole];
              return (
                <span
                  key={h.hole}
                  className={`mh ${r === 1 ? 'mh-p1' : r === 2 ? 'mh-p2' : r === 0 ? 'mh-half' : ''}`}
                  title={`Hole ${h.hole}`}
                >
                  {h.hole}
                </span>
              );
            })}
          </div>
          <div className="match-pts">
            <span>{m.pts1 % 1 ? m.pts1.toFixed(1) : m.pts1} pts</span>
            <span>{m.pts2 % 1 ? m.pts2.toFixed(1) : m.pts2} pts</span>
          </div>
        </div>
      ))}
      <div className="fine-print">
        Win = {config.round3.winPoints} pts · Halve = {config.round3.halvePoints} each · Loss = 0
      </div>
    </>
  );
}

function RoundHeader({ title, holes }) {
  const yds = holes.reduce((s, h) => s + (h.yds || 0), 0);
  return (
    <div className="round-header">
      <div className="rh-title">{title}</div>
      <div className="rh-sub">
        Par {coursePar(holes)}
        {yds > 0 && ` · ${yds.toLocaleString()} yds`}
      </div>
    </div>
  );
}
