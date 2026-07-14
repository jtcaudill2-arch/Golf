import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/store.jsx';
import { paakoHoles, blackMesaHoles, coursePar } from '../lib/scoring.js';

// Every adjustable knob in the app. All edits write to Supabase config and
// broadcast to every phone instantly. Text/number fields commit on blur.

export default function Settings({ me, setMe }) {
  const { config, setConfigKey, resetScores } = useStore();
  const players = config.players;
  const teams = config.teams;

  return (
    <div className="screen settings">
      <h1 className="hero-title pad-top">SETTINGS</h1>

      <Section title="Who am I" open>
        <select className="input" value={me || ''} onChange={(e) => setMe(e.target.value || null)}>
          <option value="">— pick your name —</option>
          {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div className="fine-print">Sets whose scorecard the "Card" tab edits on this phone.</div>
      </Section>

      <Section title="Active round">
        <div className="round-tabs round-tabs-wide">
          {[1, 2, 3].map((r) => (
            <button
              key={r}
              className={`round-tab ${config.activeRound === r ? 'on' : ''}`}
              onClick={() => setConfigKey('activeRound', r)}
            >
              ROUND {r}
            </button>
          ))}
        </div>
        <div className="fine-print">The round everyone's "Card" tab opens to by default.</div>
      </Section>

      <Section title="Players & handicaps">
        {players.map((p, i) => (
          <div key={p.id} className="row2">
            <TextField
              value={p.name}
              onCommit={(v) => setConfigKey('players', (ps) => upd(ps, i, { name: v }))}
            />
            <NumField
              value={p.handicap}
              min={0} max={54}
              onCommit={(v) => setConfigKey('players', (ps) => upd(ps, i, { handicap: v }))}
            />
          </div>
        ))}
        <div className="fine-print">Name · handicap. Changes reflect everywhere instantly.</div>
      </Section>

      <Section title="Teams">
        {teams.map((t, i) => (
          <div key={t.id} className="row3">
            <TextField
              value={t.name}
              onCommit={(v) => setConfigKey('teams', (ts) => upd(ts, i, { name: v }))}
            />
            {[0, 1].map((slot) => (
              <select
                key={slot}
                className="input"
                value={t.players[slot] || ''}
                onChange={(e) =>
                  setConfigKey('teams', (ts) =>
                    upd(ts, i, { players: t.players.map((p, s) => (s === slot ? e.target.value : p)) })
                  )
                }
              >
                {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            ))}
          </div>
        ))}
      </Section>

      <Section title="Round 1 · Individual net (Paako Ridge)">
        <NineSelect roundKey="round1" />
        <h3 className="mini-title">Groups</h3>
        {players.map((p) => {
          const gi = (config.round1.groups || []).findIndex((g) => g.includes(p.id));
          return (
            <div key={p.id} className="row2">
              <span className="label">{p.name}</span>
              <select
                className="input"
                value={gi === -1 ? '' : gi}
                onChange={(e) =>
                  setConfigKey('round1', (r1) => {
                    const groups = (r1.groups || [[], []]).map((g) => g.filter((id) => id !== p.id));
                    const target = Number(e.target.value);
                    if (!Number.isNaN(target) && groups[target]) groups[target].push(p.id);
                    return { ...r1, groups };
                  })
                }
              >
                <option value={0}>Group 1</option>
                <option value={1}>Group 2</option>
              </select>
            </div>
          );
        })}
        <h3 className="mini-title">Starting hole (for late joiners)</h3>
        {players.map((p) => (
          <div key={p.id} className="row2">
            <span className="label">{p.name}</span>
            <NumField
              value={config.round1.startHoles?.[p.id] || 1}
              min={1} max={18}
              onCommit={(v) =>
                setConfigKey('round1', (r1) => ({ ...r1, startHoles: { ...(r1.startHoles || {}), [p.id]: v } }))
              }
            />
          </div>
        ))}
        <h3 className="mini-title">Points by net finish (1st → 8th)</h3>
        <PointsRow
          values={config.round1.points}
          onCommit={(v) => setConfigKey('round1', (r1) => ({ ...r1, points: v }))}
        />
        <h3 className="mini-title">Team component</h3>
        <label className="solo-toggle">
          <input
            type="checkbox"
            checked={!!config.round1.teamBonusEnabled}
            onChange={(e) => setConfigKey('round1', (r1) => ({ ...r1, teamBonusEnabled: e.target.checked }))}
          />
          <span>Team score adds bonus points to overall standings</span>
        </label>
        <div className="fine-print">Team bonus points by finish (used only when enabled):</div>
        <PointsRow
          values={config.round1.teamPoints || [0, 0, 0, 0]}
          onCommit={(v) => setConfigKey('round1', (r1) => ({ ...r1, teamPoints: v }))}
        />
        <div className="fine-print">
          "Teammate isn't playing" toggles live on each player's Round 1 scorecard.
        </div>
      </Section>

      <Section title="Round 2 · Scramble (Paako Ridge)">
        <NineSelect roundKey="round2" />
        <h3 className="mini-title">Matchups</h3>
        {(config.round2.matchups || []).map((m, i) => (
          <div key={i} className="row2">
            {[0, 1].map((slot) => (
              <select
                key={slot}
                className="input"
                value={m[slot] || ''}
                onChange={(e) =>
                  setConfigKey('round2', (r2) => {
                    const matchups = r2.matchups.map((mm, mi) =>
                      mi === i ? mm.map((t, s) => (s === slot ? e.target.value : t)) : mm
                    );
                    return { ...r2, matchups };
                  })
                }
              >
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            ))}
          </div>
        ))}
        <h3 className="mini-title">Points by gross finish (1st → 4th)</h3>
        <PointsRow
          values={config.round2.points}
          onCommit={(v) => setConfigKey('round2', (r2) => ({ ...r2, points: v }))}
        />
      </Section>

      <Section title="Round 3 · Match play (Black Mesa)">
        {(config.round3.matches || []).map((m, i) => (
          <div key={m.id} className="match-edit">
            <div className="row2">
              <PlayerSelect players={players} value={m.p1}
                onChange={(v) => setConfigKey('round3', (r3) => ({ ...r3, matches: upd(r3.matches, i, { p1: v }) }))} />
              <PlayerSelect players={players} value={m.p2}
                onChange={(v) => setConfigKey('round3', (r3) => ({ ...r3, matches: upd(r3.matches, i, { p2: v }) }))} />
            </div>
            <div className="row2">
              <select
                className="input"
                value={m.receiver}
                onChange={(e) => setConfigKey('round3', (r3) => ({ ...r3, matches: upd(r3.matches, i, { receiver: e.target.value }) }))}
              >
                {[m.p1, m.p2].map((id) => (
                  <option key={id} value={id}>{players.find((p) => p.id === id)?.name || id} gets strokes</option>
                ))}
              </select>
              <NumField
                value={m.strokes}
                min={0} max={18}
                onCommit={(v) => setConfigKey('round3', (r3) => ({ ...r3, matches: upd(r3.matches, i, { strokes: v }) }))}
              />
            </div>
          </div>
        ))}
        <div className="row2">
          <span className="label">Win / halve points</span>
          <div className="row2">
            <NumField value={config.round3.winPoints} min={0} max={99}
              onCommit={(v) => setConfigKey('round3', (r3) => ({ ...r3, winPoints: v }))} />
            <NumField value={config.round3.halvePoints} min={0} max={99} step={0.5}
              onCommit={(v) => setConfigKey('round3', (r3) => ({ ...r3, halvePoints: v }))} />
          </div>
        </div>
      </Section>

      <Section title="Course · Paako Ridge (three nines)">
        {Object.entries(config.courses.paako.nines).map(([nid, n]) => (
          <NineEditor key={nid} nineId={nid} nine={n} />
        ))}
        <div className="fine-print">
          Stroke indexes can be 1–18. When two nines are combined, strokes are allocated by
          ranking all 18 indexes (hardest first), so per-nine 1–9 indexes work fine.
        </div>
      </Section>

      <Section title="Course · Black Mesa">
        <BlackMesaEditor />
      </Section>

      <Section title="Rules text">
        <TextArea value={config.rules} onCommit={(v) => setConfigKey('rules', v)} />
      </Section>

      <Section title="Danger zone">
        {[1, 2, 3].map((r) => (
          <button key={r} className="btn btn-danger" onClick={() => confirmReset(() => resetScores(r), `Round ${r}`)}>
            Clear all Round {r} scores
          </button>
        ))}
        <button className="btn btn-danger" onClick={() => confirmReset(() => resetScores(null), 'EVERY round')}>
          Clear ALL scores
        </button>
      </Section>
    </div>
  );
}

function confirmReset(fn, label) {
  if (window.confirm(`Delete all scores for ${label}? This hits every phone and can't be undone.`)) fn();
}

function Section({ title, children, open = false }) {
  return (
    <details className="section card" open={open}>
      <summary className="section-summary">{title}</summary>
      <div className="section-body">{children}</div>
    </details>
  );
}

function TextField({ value, onCommit }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <input
      className="input"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => v !== value && onCommit(v)}
      onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
    />
  );
}

function NumField({ value, onCommit, min = 0, max = 99, step = 1 }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  const commit = () => {
    const n = Math.min(max, Math.max(min, Number(v)));
    if (!Number.isNaN(n) && n !== value) onCommit(n);
    else setV(value);
  };
  return (
    <input
      className="input input-num"
      type="number" inputMode="decimal"
      min={min} max={max} step={step}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
    />
  );
}

function TextArea({ value, onCommit }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <textarea
      className="input rules-edit"
      rows={16}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => v !== value && onCommit(v)}
    />
  );
}

function PlayerSelect({ players, value, onChange }) {
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  );
}

function PointsRow({ values, onCommit }) {
  return (
    <div className="points-row">
      {values.map((p, i) => (
        <NumField
          key={i}
          value={p}
          min={0} max={99} step={0.5}
          onCommit={(v) => onCommit(values.map((x, xi) => (xi === i ? v : x)))}
        />
      ))}
    </div>
  );
}

// Pick which two Paako nines a round plays.
function NineSelect({ roundKey }) {
  const { config, setConfigKey } = useStore();
  const nines = config.courses.paako.nines;
  const ids = Object.keys(nines);
  const pairs = [];
  for (let i = 0; i < ids.length; i++)
    for (let j = 0; j < ids.length; j++)
      if (i !== j) pairs.push([ids[i], ids[j]]);
  const current = (config[roundKey].nines || []).join('+');
  const round = config[roundKey];
  const holes = paakoHoles(config.courses, round.nines || []);
  return (
    <>
      <h3 className="mini-title">Which two nines?</h3>
      <select
        className="input"
        value={current}
        onChange={(e) => setConfigKey(roundKey, (r) => ({ ...r, nines: e.target.value.split('+') }))}
      >
        {pairs.map(([a, b]) => (
          <option key={`${a}+${b}`} value={`${a}+${b}`}>
            {nines[a].name} + {nines[b].name}
          </option>
        ))}
      </select>
      <div className="fine-print">Front 9 = {nines[round.nines?.[0]]?.name}, back 9 = {nines[round.nines?.[1]]?.name} · Par {coursePar(holes)}</div>
    </>
  );
}

function NineEditor({ nineId, nine }) {
  const { setConfigKey } = useStore();
  const set = (holeIdx, patch) =>
    setConfigKey('courses', (c) => ({
      ...c,
      paako: {
        ...c.paako,
        nines: {
          ...c.paako.nines,
          [nineId]: { ...c.paako.nines[nineId], holes: upd(c.paako.nines[nineId].holes, holeIdx, patch) },
        },
      },
    }));
  return (
    <div className="nine-editor">
      <h3 className="mini-title">{nine.name} · Par {nine.holes.reduce((s, h) => s + h.par, 0)}</h3>
      <HoleTable holes={nine.holes} onSet={set} />
    </div>
  );
}

function BlackMesaEditor() {
  const { config, setConfigKey } = useStore();
  const holes = config.courses.blackmesa.holes;
  const set = (holeIdx, patch) =>
    setConfigKey('courses', (c) => ({
      ...c,
      blackmesa: { ...c.blackmesa, holes: upd(c.blackmesa.holes, holeIdx, patch) },
    }));
  return (
    <>
      <h3 className="mini-title">Black Mesa · Par {coursePar(blackMesaHoles(config.courses))}</h3>
      <div className="fine-print">Back nine is from the real card; correct the front nine on site.</div>
      <HoleTable holes={holes} onSet={set} />
    </>
  );
}

function HoleTable({ holes, onSet }) {
  return (
    <div className="hole-table">
      <div className="ht-row ht-head"><span>#</span><span>PAR</span><span>INDEX</span></div>
      {holes.map((h, i) => (
        <div key={h.hole} className="ht-row">
          <span className="ht-num">{h.hole}</span>
          <div className="par-picker">
            {[3, 4, 5].map((p) => (
              <button key={p} className={`par-btn ${h.par === p ? 'on' : ''}`} onClick={() => onSet(i, { par: p })}>
                {p}
              </button>
            ))}
          </div>
          <NumField value={h.si} min={1} max={18} onCommit={(v) => onSet(i, { si: v })} />
        </div>
      ))}
    </div>
  );
}

const upd = (arr, i, patch) => arr.map((x, xi) => (xi === i ? { ...x, ...patch } : x));
