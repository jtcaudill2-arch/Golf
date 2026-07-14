import React from 'react';
import { useStore } from '../lib/store.jsx';
import { teamStandings, round1TeamResults } from '../lib/scoring.js';
import Zia from '../components/Zia.jsx';
import MesaHero from '../components/MesaHero.jsx';

export default function Home() {
  const { config, scores, status } = useStore();
  const standings = teamStandings(config, scores);
  const teamCard = round1TeamResults(config, scores);
  const anyPoints = standings.some((r) => r.total > 0);

  return (
    <div className="screen screen-home">
      <MesaHero>
        <h1 className="mesa-title">{(config.eventName || 'Cuck Cup').toUpperCase()}</h1>
        <div className="mesa-sub">
          STANDINGS
          {status === 'live' ? (
            <span className="live-badge">
              <span className="live-badge-dot" />
              LIVE
            </span>
          ) : (
            <span className="conn">○ connecting</span>
          )}
        </div>
      </MesaHero>

      <div className="table-wrap card">
        <table className="lb">
          <thead>
            <tr>
              <th></th>
              <th className="lb-name">TEAM</th>
              <th>R1</th>
              <th>R2</th>
              <th>R3</th>
              {config.round1.teamBonusEnabled && <th>BNS</th>}
              <th className="lb-total">PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((t) => {
              const cols = config.round1.teamBonusEnabled ? 4 : 3;
              const leader = t.rank === 1 && anyPoints;
              return (
                <React.Fragment key={t.id}>
                  <tr className={`lb-team ${leader ? 'lb-leader' : ''}`}>
                    <td className="lb-rank">{leader ? <Zia size={20} /> : t.rank}</td>
                    <td className="lb-name">{t.name}</td>
                    <td colSpan={cols}></td>
                    <td className="lb-total">{fmt(t.total)}</td>
                  </tr>
                  {t.members.map((m) => (
                    <tr key={m.id} className={`lb-member ${leader ? 'lb-leader' : ''}`}>
                      <td></td>
                      <td className="lb-name lb-member-name">{m.name}</td>
                      <td>{fmt(m.r1)}</td>
                      <td>{fmt(m.r2)}</td>
                      <td>{fmt(m.r3)}</td>
                      {config.round1.teamBonusEnabled && <td>{fmt(m.bonus)}</td>}
                      <td className="lb-member-total">{fmt(m.total)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="fine-print">
        Team points = both players' points combined. Updates live — unfinished rounds
        show projected points.
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
