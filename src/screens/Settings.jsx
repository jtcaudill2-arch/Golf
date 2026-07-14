import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/store.jsx';
import { paakoHoles, blackMesaHoles, coursePar, selectedTee, ydsForTee, matchHandicapStrokes, capPhrase } from '../lib/scoring.js';
import { DEFAULT_MAX_OVER_PAR, HANDICAP_MIN, HANDICAP_MAX } from '../lib/defaults.js';

// Every adjustable knob in the app. All edits write to Supabase config and
// broadcast to every phone instantly. Text/number fields commit on blur.

export default function Settings({ me, setMe }) {
  const { config, setConfigKey, resetScores } = useStore();
  const players = config.players;
  const teams = config.teams;

  return (
    <div className="screen settings">
      <h1 className="hero-title pad-top">SETTINGS</h1>

      <Section title="Event name">
        <TextField value={config.eventName || 'Cuck Cup'} onCommit={(v) => setConfigKey('eventName', v)} />
        <div className="fine-print">Shown in the header and on the Live standings.</div>
      </Section>

      <Section title="Who am I" open>
        <select className="input" value={me || ''} onChange={(e) => setMe(e.target.value || null)}>
          <option value="">— pick your name —</option>
          {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div className="fine-print">Sets whose scorecard the "Card" tab edits on this phone.</div>
        <MyTeamName me={me} />
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
              min={HANDICAP_MIN} max={HANDICAP_MAX}
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
                  // Swap semantics on fresh state: putting a player in this
                  // slot moves the displaced player to wherever the incoming
                  // player was, so nobody can end up on two teams.
                  setConfigKey('teams', (ts) => {
                    const incoming = e.target.value;
                    const displaced = ts[i]?.players[slot];
                    return ts.map((team, ti) => ({
                      ...team,
                      players: team.players.map((p, s) => {
                        if (ti === i && s === slot) return incoming;
                        if (p === incoming) return displaced;
                        return p;
                      }),
                    }));
                  })
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
          onCommitAt={(i, v) =>
            setConfigKey('round1', (r1) => ({ ...r1, points: r1.points.map((x, xi) => (xi === i ? v : x)) }))
          }
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
          onCommitAt={(i, v) =>
            setConfigKey('round1', (r1) => ({
              ...r1,
              teamPoints: (r1.teamPoints || [0, 0, 0, 0]).map((x, xi) => (xi === i ? v : x)),
            }))
          }
        />
        <div className="fine-print">
          "Teammate isn't playing" toggles live on each player's Round 1 scorecard.
        </div>
        <MaxOverPar roundKey="round1" />
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
          onCommitAt={(i, v) =>
            setConfigKey('round2', (r2) => ({ ...r2, points: r2.points.map((x, xi) => (xi === i ? v : x)) }))
          }
        />
        <MaxOverPar roundKey="round2" />
      </Section>

      <Section title="Round 3 · Match play (Black Mesa)">
        {(config.round3.matches || []).map((m, i) => {
          const hs = matchHandicapStrokes(config, m);
          const receiverName = hs.receiver ? players.find((p) => p.id === hs.receiver)?.name : null;
          return (
            <div key={m.id} className="match-edit">
              <div className="row2">
                <PlayerSelect players={players} value={m.p1}
                  onChange={(v) => setConfigKey('round3', (r3) => ({ ...r3, matches: upd(r3.matches, i, { p1: v }) }))} />
                <PlayerSelect players={players} value={m.p2}
                  onChange={(v) => setConfigKey('round3', (r3) => ({ ...r3, matches: upd(r3.matches, i, { p2: v }) }))} />
              </div>
              <div className="fine-print">
                {hs.strokes > 0
                  ? `${receiverName} gets ${hs.strokes} stroke${hs.strokes > 1 ? 's' : ''} (auto, from current handicaps)`
                  : 'Handicaps are even — no strokes given'}
              </div>
            </div>
          );
        })}
        <div className="fine-print">
          Strokes given recalculate automatically whenever either player's handicap
          changes. Only the matchups (who plays whom) are set here.
        </div>
        <div className="row2">
          <span className="label">Win / halve points</span>
          <div className="row2">
            <NumField value={config.round3.winPoints} min={0} max={99}
              onCommit={(v) => setConfigKey('round3', (r3) => ({ ...r3, winPoints: v }))} />
            <NumField value={config.round3.halvePoints} min={0} max={99} step={0.5}
              onCommit={(v) => setConfigKey('round3', (r3) => ({ ...r3, halvePoints: v }))} />
          </div>
        </div>
        <MaxOverPar roundKey="round3" />
      </Section>

      <Section title="Course · Paako Ridge (three nines)">
        <TeePicker courseKey="paako" />
        {Object.entries(config.courses.paako.nines).map(([nid, n]) => (
          <NineEditor key={nid} nineId={nid} nine={n} />
        ))}
        <div className="fine-print">
          All three nines are from the official 2023 printed card, with every tee's
          yardage. When two nines are combined, handicap strokes are allocated by ranking
          all 18 stroke indexes (hardest first), so mixed per-nine indexes work fine.
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

// Quick rename for the signed-in player's own team, shown right under the
// identity picker so nobody has to dig through the Teams editor.
function MyTeamName({ me }) {
  const { config, setConfigKey } = useStore();
  const idx = config.teams.findIndex((t) => t.players.includes(me));
  if (idx === -1) return null;
  const team = config.teams[idx];
  const teammate = config.players.find(
    (p) => team.players.includes(p.id) && p.id !== me
  );
  return (
    <>
      <h3 className="mini-title">My team name</h3>
      <TextField
        value={team.name}
        onCommit={(v) => setConfigKey('teams', (ts) => upd(ts, idx, { name: v }))}
      />
      <div className="fine-print">
        You{teammate ? ` + ${teammate.name}` : ''} — shows on the leaderboard for everyone.
      </div>
    </>
  );
}

// Pick-up cap for a round's scorecards (e.g. 3 = triple bogey max,
// 4 = quadruple bogey max). Read live by HoleEntry on every card.
function MaxOverPar({ roundKey }) {
  const { config, setConfigKey } = useStore();
  const roundNum = Number(roundKey.replace('round', ''));
  const value = config[roundKey].maxOverPar ?? DEFAULT_MAX_OVER_PAR[roundNum] ?? 3;
  return (
    <>
      <h3 className="mini-title">Max score per hole (pick-up rule)</h3>
      <NumField
        value={value}
        min={1} max={8}
        onCommit={(v) => setConfigKey(roundKey, (r) => ({ ...r, maxOverPar: v }))}
      />
      <div className="fine-print">
        Strokes over par allowed before pick-up — {value} = {capPhrase(value)} max.
      </div>
    </>
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
    if (String(v).trim() === '') { setV(value); return; } // cleared field: revert, don't commit the min
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

function PointsRow({ values, onCommitAt }) {
  return (
    <div className="points-row">
      {values.map((p, i) => (
        <NumField
          key={i}
          value={p}
          min={0} max={99} step={0.5}
          onCommit={(v) => onCommitAt(i, v)}
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

// Tee-set picker + editable tee names for a course ('paako' | 'blackmesa').
function TeePicker({ courseKey }) {
  const { config, setConfigKey } = useStore();
  const course = config.courses[courseKey];
  const tees = course.tees || [];
  const tee = selectedTee(config.courses, courseKey);
  const setCourse = (patch) =>
    setConfigKey('courses', (c) => ({ ...c, [courseKey]: { ...c[courseKey], ...patch } }));
  return (
    <>
      <h3 className="mini-title">Tees we're playing</h3>
      <select
        className="input"
        value={tee?.id || ''}
        onChange={(e) => setCourse({ selectedTee: e.target.value })}
      >
        {tees.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <div className="fine-print">
        Sets which tee's yardages show on every scorecard, and which tee the YDS column
        below edits. Tee names are editable:
      </div>
      <div className="points-row">
        {tees.map((t, i) => (
          <TextField
            key={t.id}
            value={t.name}
            onCommit={(v) => setCourse({ tees: upd(tees, i, { name: v }) })}
          />
        ))}
      </div>
    </>
  );
}

function NineEditor({ nineId, nine }) {
  const { config, setConfigKey } = useStore();
  const tee = selectedTee(config.courses, 'paako');
  const nineYds = nine.holes.reduce((s, h) => s + (ydsForTee(h, tee?.id) || 0), 0);
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
      <h3 className="mini-title">
        {nine.name} · Par {nine.holes.reduce((s, h) => s + h.par, 0)}
        {nineYds > 0 && ` · ${nineYds.toLocaleString()} yds (${tee?.name})`}
      </h3>
      {nine.verified === false && (
        <div className="notice">
          Hole-by-hole card for this nine isn't published online — enter par, index and
          yards from the printed card on site.
        </div>
      )}
      <HoleTable holes={nine.holes} onSet={set} tee={tee} />
    </div>
  );
}

function BlackMesaEditor() {
  const { config, setConfigKey } = useStore();
  const tee = selectedTee(config.courses, 'blackmesa');
  const holes = config.courses.blackmesa.holes;
  const set = (holeIdx, patch) =>
    setConfigKey('courses', (c) => ({
      ...c,
      blackmesa: { ...c.blackmesa, holes: upd(c.blackmesa.holes, holeIdx, patch) },
    }));
  const totalYds = holes.reduce((s, h) => s + (ydsForTee(h, tee?.id) || 0), 0);
  return (
    <>
      <h3 className="mini-title">
        Black Mesa · Par {coursePar(blackMesaHoles(config.courses))}
        {totalYds > 0 && ` · ${totalYds.toLocaleString()} yds (${tee?.name})`}
      </h3>
      <div className="fine-print">
        Black tees are the official card (golfblackmesa.com). Other tees: enter yardages
        from the printed card and rename them to match.
      </div>
      <TeePicker courseKey="blackmesa" />
      <HoleTable holes={holes} onSet={set} tee={tee} />
    </>
  );
}

function HoleTable({ holes, onSet, tee }) {
  // Merge a yardage edit into the per-tee yds map, converting any legacy
  // plain-number yds into the map form.
  const setYds = (h, i, v) => {
    const base = h.yds && typeof h.yds === 'object' ? h.yds : {};
    onSet(i, { yds: { ...base, [tee?.id || 'black']: v } });
  };
  return (
    <div className="hole-table">
      <div className="ht-row ht-head">
        <span>#</span><span>PAR</span><span>INDEX</span>
        <span>YDS{tee ? ` · ${tee.name.toUpperCase()}` : ''}</span>
      </div>
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
          <YdsField value={ydsForTee(h, tee?.id)} onCommit={(v) => setYds(h, i, v)} />
        </div>
      ))}
    </div>
  );
}

// Yardage input that tolerates being empty (unknown yardage stays blank).
function YdsField({ value, onCommit }) {
  const [v, setV] = useState(value ?? '');
  useEffect(() => setV(value ?? ''), [value]);
  const commit = () => {
    if (String(v).trim() === '') { if (value != null) onCommit(null); return; }
    const n = Math.min(999, Math.max(0, Number(v)));
    if (!Number.isNaN(n) && n !== value) onCommit(n);
    else setV(value ?? '');
  };
  return (
    <input
      className="input input-num"
      type="number" inputMode="numeric"
      min={0} max={999}
      placeholder="–"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
    />
  );
}

const upd = (arr, i, patch) => arr.map((x, xi) => (xi === i ? { ...x, ...patch } : x));
