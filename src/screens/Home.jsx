import React from 'react';
import { useStore } from '../lib/store.jsx';
import { overallStandings, round1TeamResults } from '../lib/scoring.js';
import Zia from '../components/Zia.jsx';

export default function Home() {
  const { config, scores, status } = useStore();
  const standings = overallStandings(config, scores);
  const teamCard = round1TeamResults(config, scores);
  const anyPoints = standings.some((r) => r.total > 0);

  return (
    <div className="screen">
      <div className="hero">
        <Zia size={44} />
        <div>
          <h1 className="hero-title">ZIA CUP STANDINGS</h1>
          <div className="hero-sub">
            Live across all three rounds
            <span className={`conn ${status === 'live' ? 'conn-live' : ''}`}>
              {status === 'live' ? '● LIVE' : '○ connecting'}
            </span>
          </div>
        </div>
      </div>

      <div className="table-wrap card">
        <table className="lb">
          <thead>
            <tr>
              <th></th>
              <th className="lb-name">PLAYER</th>
              <th>R1</th>
              <th>R2</th>
              <th>R3</th>
              {config.round1.teamBonusEnabled && <th>BNS</th>}
              <th className="lb-total">PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((r) => (
              <tr key={r.id} className={r.rank === 1 && anyPoints ? 'lb-leader' : ''}>
                <td className="lb-rank">
                  {r.rank === 1 && anyPoints ? <Zia size={20} /> : r.rank}
                </td>
                <td className="lb-name">{r.name}</td>
                <td>{fmt(r.r1)}</td>
                <td>{fmt(r.r2)}</td>
                <td>{fmt(r.r3)}</td>
                {config.round1.teamBonusEnabled && <td>{fmt(r.bonus)}</td>}
                <td className="lb-total">{fmt(r.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="fine-print">
        Points update live as scores come in — unfinished rounds show projected points.
      </div>

      <h2 className="section-title">ROUND 1 · TEAM</h2>
      <div className="card stat-card">
        {teamCard.map((t) => (
          <div key={t.id} className="stat-row">
            <span className="stat-rank">{t.rank ?? '–'}</span>
            <span className="stat-name">
              {t.name}
              <span className="stat-detail">{t.detail}</span>
            </span>
            <span className="stat-value">{t.net != null ? `${round1(t.net)} net` : '–'}</span>
            {config.round1.teamBonusEnabled && <span className="stat-pts">{fmt(t.points)} pts</span>}
          </div>
        ))}
        <div className="fine-print">
          {config.round1.teamBonusEnabled
            ? 'Team bonus points are ON and count toward the standings.'
            : 'Bragging rights only — bonus points are off (toggle in Settings).'}
        </div>
      </div>
    </div>
  );
}

const fmt = (n) => (n === 0 ? '0' : n % 1 === 0 ? String(n) : n.toFixed(1));
const round1 = (n) => (n % 1 === 0 ? String(n) : n.toFixed(1));
