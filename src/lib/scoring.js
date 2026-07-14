// All scoring math lives here, pure functions over (config, scores).
// `scores` shape: scores[roundId][entityId][hole] = gross strokes (int).

// ---------------------------------------------------------------- courses

// Rank holes by stored stroke index (ties broken by card order) and assign an
// effective SI of 1-18. This makes handicap allocation work even when two
// combined nines both carry SI 1-9, or while placeholder indexes are in play.
export function withEffectiveSI(holes) {
  const order = holes
    .map((h, i) => ({ i, si: h.si ?? 99 }))
    .sort((a, b) => a.si - b.si || a.i - b.i);
  const eff = new Array(holes.length);
  order.forEach((o, rank) => { eff[o.i] = rank + 1; });
  return holes.map((h, i) => ({ ...h, effSi: eff[i] }));
}

// Yardage for a hole from a given tee set. Tolerates the legacy shape where
// yds was a plain number (treated as the value for every tee).
export function ydsForTee(h, teeId) {
  if (h.yds == null) return null;
  if (typeof h.yds === 'number') return h.yds;
  return h.yds[teeId] ?? null;
}

// The tee set currently selected for a course ('paako' | 'blackmesa').
export function selectedTee(courses, courseKey) {
  const c = courses[courseKey];
  if (!c?.tees?.length) return null;
  return c.tees.find((t) => t.id === c.selectedTee) || c.tees[0];
}

// 18 holes for a Paako round from the two selected nines, with yardage
// resolved from the selected tee set.
export function paakoHoles(courses, nineIds) {
  const tee = selectedTee(courses, 'paako');
  const holes = [];
  nineIds.forEach((id, ni) => {
    const n = courses.paako.nines[id];
    if (!n) return;
    n.holes.forEach((h, hi) => {
      holes.push({
        ...h,
        hole: ni * 9 + hi + 1,
        nineName: n.name,
        nineHole: h.hole,
        yds: ydsForTee(h, tee?.id),
      });
    });
  });
  return withEffectiveSI(holes);
}

export function blackMesaHoles(courses) {
  const tee = selectedTee(courses, 'blackmesa');
  return withEffectiveSI(
    courses.blackmesa.holes.map((h) => ({ ...h, yds: ydsForTee(h, tee?.id) }))
  );
}

export function holesForRound(config, roundId) {
  if (roundId === 1) return paakoHoles(config.courses, config.round1.nines);
  if (roundId === 2) return paakoHoles(config.courses, config.round2.nines);
  return blackMesaHoles(config.courses);
}

export const coursePar = (holes) => holes.reduce((s, h) => s + h.par, 0);

// ---------------------------------------------------------------- handicap

// Strokes received on a hole: hardest holes (lowest effective SI) first,
// wrapping past 18 for handicaps above 18.
export function strokesOnHole(handicap, effSi) {
  const h = Math.max(0, Math.round(handicap || 0));
  return Math.floor(h / 18) + (effSi <= h % 18 ? 1 : 0);
}

// ---------------------------------------------------------------- badges

// Standard golf scorecard notation for a gross/net score vs par.
export function badge(diff) {
  if (diff <= -2) return 'eagle';   // double circle
  if (diff === -1) return 'birdie'; // circle
  if (diff === 0) return 'par';     // plain
  if (diff === 1) return 'bogey';   // square
  return 'double';                  // double square
}

export const relText = (diff) => (diff === 0 ? 'E' : diff > 0 ? `+${diff}` : `${diff}`);

// ---------------------------------------------------------------- totals

export function cardTotals(holes, holeScores, handicap = 0) {
  let gross = 0, toPar = 0, netToPar = 0, played = 0;
  for (const h of holes) {
    const s = holeScores?.[h.hole];
    if (s == null) continue;
    played += 1;
    gross += s;
    toPar += s - h.par;
    netToPar += s - strokesOnHole(handicap, h.effSi) - h.par;
  }
  return { gross, toPar, netToPar, played };
}

// Split point values across tied positions (e.g. two tied for 1st on a
// 10/8/... table each get 9).
export function assignPoints(ranked, pointTable, key) {
  const out = {};
  let i = 0;
  while (i < ranked.length) {
    let j = i;
    while (j + 1 < ranked.length && ranked[j + 1][key] === ranked[i][key]) j++;
    const pool = pointTable.slice(i, j + 1).reduce((s, p) => s + (p ?? 0), 0);
    const each = pool / (j - i + 1);
    for (let k = i; k <= j; k++) out[ranked[k].id] = each;
    i = j + 1;
  }
  return out;
}

// Points/number formatter shared by every screen (half points from halves
// and split ties).
export const fmtPts = (n) => (n % 1 === 0 ? String(n) : n.toFixed(1));

// Word for "n strokes over par" (1 = bogey, 2 = double, ...), shared by the
// score-entry cap message/reaction and the Scoring explainer tab.
const ORDINALS = ['', 'Bogey', 'Double', 'Triple', 'Quadruple', 'Quintuple', 'Sextuple'];
export const ordinalWord = (n) => ORDINALS[n] || `${n}x`;

// Total yardage for a hole list whose yds are already tee-resolved.
export const totalYds = (holes) => holes.reduce((s, h) => s + (h.yds || 0), 0);

// Sort scored rows, assign rank + points (ties split), tack unscored on the
// end — the shared tail of every round-results function.
function rankAndPoints(rows, key, pointTable) {
  const scored = rows.filter((r) => r[key] != null).sort((a, b) => a[key] - b[key]);
  const unscored = rows.filter((r) => r[key] == null);
  const points = assignPoints(scored, pointTable, key);
  scored.forEach((r, i) => { r.rank = i + 1; r.points = points[r.id] ?? 0; });
  unscored.forEach((r) => { r.rank = null; r.points = 0; });
  return [...scored, ...unscored];
}

// Shared tie-aware rank pass for the standings tables (descending totals).
function tieRanks(rows) {
  rows.forEach((r, i) => {
    r.rank = i > 0 && rows[i - 1].total === r.total ? rows[i - 1].rank : i + 1;
  });
}

// ---------------------------------------------------------------- round 1

export function round1Results(config, scores) {
  const holes = holesForRound(config, 1);
  const r1scores = scores[1] || {};
  const rows = config.players.map((p) => {
    const t = cardTotals(holes, r1scores[p.id], p.handicap);
    const start = config.round1.startHoles?.[p.id] || 1;
    return {
      id: p.id, name: p.name, handicap: p.handicap, startHole: start,
      gross: t.gross, toPar: t.toPar, played: t.played,
      net: t.played > 0 ? t.gross - p.handicap : null,
    };
  });
  return { holes, rows: rankAndPoints(rows, 'net', config.round1.points) };
}

// Round 1 team component: best net of the pair, or (solo gross − average of
// both handicaps) when a team is flagged as playing solo.
export function round1TeamResults(config, scores) {
  const holes = holesForRound(config, 1);
  const r1scores = scores[1] || {};
  const byId = Object.fromEntries(config.players.map((p) => [p.id, p]));
  const rows = config.teams.map((team) => {
    const [aId, bId] = team.players;
    const a = byId[aId], b = byId[bId];
    const soloId = config.round1.soloTeams?.[team.id];
    // A solo flag only counts while the flagged player is still on this team.
    if (soloId && byId[soloId] && team.players.includes(soloId)) {
      const solo = byId[soloId];
      const t = cardTotals(holes, r1scores[solo.id], 0);
      const avgHcp = (Number(a?.handicap ?? 0) + Number(b?.handicap ?? 0)) / 2;
      return {
        id: team.id, name: team.name, solo: true,
        detail: `${solo.name} solo · gross − avg hcp (${avgHcp})`,
        net: t.played > 0 ? t.gross - avgHcp : null, played: t.played,
      };
    }
    const nets = [a, b].filter(Boolean).map((p) => {
      const t = cardTotals(holes, r1scores[p.id], 0);
      return t.played > 0 ? { name: p.name, net: t.gross - p.handicap, played: t.played } : null;
    }).filter(Boolean);
    const best = nets.sort((x, y) => x.net - y.net)[0] || null;
    return {
      id: team.id, name: team.name, solo: false,
      detail: best ? `best net: ${best.name}` : 'no scores yet',
      net: best?.net ?? null, played: best?.played ?? 0,
    };
  });
  return rankAndPoints(rows, 'net', config.round1.teamPoints || []);
}

// ---------------------------------------------------------------- round 2

export function round2Results(config, scores) {
  const holes = holesForRound(config, 2);
  const r2scores = scores[2] || {};
  const rows = config.teams.map((team) => {
    const t = cardTotals(holes, r2scores[team.id], 0);
    return {
      id: team.id, name: team.name, players: team.players,
      gross: t.played > 0 ? t.gross : null, toPar: t.toPar, played: t.played,
    };
  });
  return { holes, rows: rankAndPoints(rows, 'gross', config.round2.points) };
}

// ---------------------------------------------------------------- round 3

// Match-play strokes given: the higher-handicap player receives the full
// difference between the two current handicaps, allocated to the hardest
// holes by stroke index. Computed live from config.players every time it's
// called — there's nothing to keep in sync when a handicap changes, and no
// stale-receiver bug possible, since neither value is ever stored.
export function matchHandicapStrokes(config, match) {
  const byId = Object.fromEntries(config.players.map((p) => [p.id, p]));
  const h1 = Number(byId[match.p1]?.handicap ?? 0);
  const h2 = Number(byId[match.p2]?.handicap ?? 0);
  const diff = Math.abs(h1 - h2);
  const receiver = diff === 0 ? null : h1 > h2 ? match.p1 : match.p2;
  return { receiver, strokes: diff };
}

// Hole-by-hole match play with strokes given on the hardest holes.
// Returns live status ("2 UP thru 7"), auto-detected closeouts ("3&2"),
// and the full-18 case ("1 UP" / "AS").
export function matchState(config, scores, match, holes = null) {
  holes = holes || blackMesaHoles(config.courses);
  const r3 = scores[3] || {};
  const byId = Object.fromEntries(config.players.map((p) => [p.id, p]));
  const p1 = byId[match.p1], p2 = byId[match.p2];
  const { receiver, strokes: given } = matchHandicapStrokes(config, match);
  let up = 0; // positive = p1 up
  let thru = 0;
  const holeResults = {};
  let closed = null;

  for (const h of holes) {
    const s1 = r3[match.p1]?.[h.hole];
    const s2 = r3[match.p2]?.[h.hole];
    if (s1 == null || s2 == null) break;
    const strokesFor = (id) => (id === receiver ? strokesOnHole(given, h.effSi) : 0);
    const n1 = s1 - strokesFor(match.p1);
    const n2 = s2 - strokesFor(match.p2);
    thru = h.hole;
    if (n1 < n2) { up += 1; holeResults[h.hole] = 1; }
    else if (n2 < n1) { up -= 1; holeResults[h.hole] = 2; }
    else holeResults[h.hole] = 0;
    const remaining = holes.length - h.hole;
    // A win on the final hole is "N UP", not a closeout — only close early.
    if (remaining > 0 && Math.abs(up) > remaining) {
      closed = { winner: up > 0 ? match.p1 : match.p2, label: `${Math.abs(up)}&${remaining}` };
      break;
    }
  }

  let status, winner = null, done = false;
  if (thru === 0) {
    status = 'Not started';
  } else if (closed) {
    winner = closed.winner; done = true;
    status = `${byId[winner]?.name} wins ${closed.label}`;
  } else if (thru === holes.length) {
    done = true;
    if (up === 0) status = 'Halved (AS)';
    else { winner = up > 0 ? match.p1 : match.p2; status = `${byId[winner]?.name} wins ${Math.abs(up)} UP`; }
  } else if (up === 0) {
    status = `All square thru ${thru}`;
  } else {
    const leader = up > 0 ? p1 : p2;
    status = `${leader?.name} ${Math.abs(up)} UP thru ${thru}`;
  }
  return {
    up, thru, status, winner, done, halved: done && !winner, holeResults, p1, p2,
    receiver, strokes: given,
  };
}

export function round3Results(config, scores) {
  const { winPoints, halvePoints } = config.round3;
  const holes = blackMesaHoles(config.courses);
  const points = {};
  const matches = config.round3.matches.map((m) => {
    const st = matchState(config, scores, m, holes);
    // Live standings: leader projected to win, ties projected halved.
    let pts1 = 0, pts2 = 0;
    if (st.thru > 0) {
      if (st.done) {
        if (st.halved) { pts1 = halvePoints; pts2 = halvePoints; }
        else if (st.winner === m.p1) pts1 = winPoints;
        else pts2 = winPoints;
      } else if (st.up > 0) pts1 = winPoints;
      else if (st.up < 0) pts2 = winPoints;
      else { pts1 = halvePoints; pts2 = halvePoints; }
    }
    points[m.p1] = (points[m.p1] || 0) + pts1;
    points[m.p2] = (points[m.p2] || 0) + pts2;
    // Override any stale stored receiver/strokes with the live-computed
    // values so every consumer (Rounds, MyCard) always sees current data.
    return { ...m, receiver: st.receiver, strokes: st.strokes, state: st, pts1, pts2 };
  });
  return { matches, points, holes };
}

// ---------------------------------------------------------------- overall

export function overallStandings(config, scores) {
  const r1 = round1Results(config, scores);
  const bonusOn = !!config.round1.teamBonusEnabled;
  const r1team = bonusOn ? round1TeamResults(config, scores) : null;
  const r2 = round2Results(config, scores);
  const r3 = round3Results(config, scores);

  const rows = config.players.map((p) => {
    const p1 = r1.rows.find((r) => r.id === p.id)?.points || 0;
    const myTeam = config.teams.find((t) => t.players.includes(p.id));
    const p2 = r2.rows.find((r) => r.id === myTeam?.id)?.points || 0;
    const p3 = r3.points[p.id] || 0;
    const bonus = bonusOn ? (r1team.find((r) => r.id === myTeam?.id)?.points || 0) : 0;
    return { id: p.id, name: p.name, r1: p1, r2: p2, r3: p3, bonus, total: p1 + p2 + p3 + bonus };
  });
  rows.sort((a, b) => b.total - a.total);
  tieRanks(rows);
  return rows;
}

// Team leaderboard: each team's total is the sum of its two players' points,
// with the per-player breakdown kept for display underneath the team row.
export function teamStandings(config, scores) {
  const players = overallStandings(config, scores);
  const rows = config.teams.map((t) => {
    const members = t.players
      .map((pid) => players.find((p) => p.id === pid))
      .filter(Boolean);
    return {
      id: t.id,
      name: t.name,
      members,
      total: members.reduce((s, m) => s + m.total, 0),
    };
  });
  rows.sort((a, b) => b.total - a.total);
  tieRanks(rows);
  return rows;
}
