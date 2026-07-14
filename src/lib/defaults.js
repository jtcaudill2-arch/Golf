// Default (seed) configuration. Everything here is editable in Settings and
// stored in the Supabase `config` table — these values only apply the first
// time the app runs against an empty database.

const nine = (names) =>
  names.map((si, i) => ({ hole: i + 1, par: 4, si }));

export const DEFAULT_PLAYERS = [
  { id: 'jt', name: 'JT', handicap: 18 },
  { id: 'keegan', name: 'Keegan', handicap: 12 },
  { id: 'tyler', name: 'Tyler', handicap: 28 },
  { id: 'jack', name: 'Jack', handicap: 16 },
  { id: 'beck', name: 'Beck', handicap: 25 },
  { id: 'nathan', name: 'Nathan', handicap: 14 },
  { id: 'colton', name: 'Colton', handicap: 23 },
  { id: 'alex', name: 'Alex', handicap: 20 },
];

export const DEFAULT_TEAMS = [
  { id: 'team1', name: 'Team 1', players: ['keegan', 'tyler'] },
  { id: 'team2', name: 'Team 2', players: ['jack', 'beck'] },
  { id: 'team3', name: 'Team 3', players: ['nathan', 'colton'] },
  { id: 'team4', name: 'Team 4', players: ['alex', 'jt'] },
];

export const DEFAULT_COURSES = {
  paako: {
    name: 'Paako Ridge',
    nines: {
      nine1: { name: 'Nine 1', holes: nine([1, 2, 3, 4, 5, 6, 7, 8, 9]) },
      nine2: { name: 'Nine 2', holes: nine([1, 2, 3, 4, 5, 6, 7, 8, 9]) },
      nine3: { name: 'Nine 3', holes: nine([1, 2, 3, 4, 5, 6, 7, 8, 9]) },
    },
  },
  blackmesa: {
    name: 'Black Mesa',
    holes: [
      // Front nine unconfirmed — placeholder pars/indexes, correct on site.
      { hole: 1, par: 4, si: 1 },
      { hole: 2, par: 4, si: 2 },
      { hole: 3, par: 4, si: 3 },
      { hole: 4, par: 4, si: 4 },
      { hole: 5, par: 4, si: 5 },
      { hole: 6, par: 4, si: 6 },
      { hole: 7, par: 4, si: 7 },
      { hole: 8, par: 4, si: 8 },
      { hole: 9, par: 4, si: 9 },
      // Back nine from the real card.
      { hole: 10, par: 4, si: 6 },
      { hole: 11, par: 3, si: 18 },
      { hole: 12, par: 4, si: 12 },
      { hole: 13, par: 5, si: 8 },
      { hole: 14, par: 4, si: 16 },
      { hole: 15, par: 3, si: 14 },
      { hole: 16, par: 5, si: 4 },
      { hole: 17, par: 4, si: 2 },
      { hole: 18, par: 4, si: 10 },
    ],
  },
};

export const DEFAULT_ROUND1 = {
  name: 'Round 1 · Paako Ridge · Individual Net',
  nines: ['nine1', 'nine2'],
  groups: [
    ['jt', 'nathan', 'keegan', 'colton'],
    ['tyler', 'beck', 'alex', 'jack'],
  ],
  // Players who join their group partway through start on a later hole.
  startHoles: { colton: 1, alex: 1 },
  points: [10, 8, 7, 6, 4, 3, 1, 0],
  // teamId -> playerId of the guy playing solo ("my teammate isn't playing").
  soloTeams: {},
  teamBonusEnabled: false,
  teamPoints: [4, 3, 2, 1],
};

export const DEFAULT_ROUND2 = {
  name: 'Round 2 · Paako Ridge · 2-Man Scramble',
  nines: ['nine1', 'nine3'],
  matchups: [
    ['team4', 'team1'],
    ['team2', 'team3'],
  ],
  points: [16, 10, 6, 2],
};

export const DEFAULT_ROUND3 = {
  name: 'Round 3 · Black Mesa · Match Play',
  matches: [
    { id: 'm1', p1: 'jack', p2: 'jt', receiver: 'jt', strokes: 2 },
    { id: 'm2', p1: 'beck', p2: 'tyler', receiver: 'tyler', strokes: 3 },
    { id: 'm3', p1: 'keegan', p2: 'nathan', receiver: 'nathan', strokes: 2 },
    { id: 'm4', p1: 'alex', p2: 'colton', receiver: 'colton', strokes: 3 },
  ],
  winPoints: 15,
  halvePoints: 7.5,
};

export const DEFAULT_RULES = `ZIA CUP — HOUSE RULES

1. HAZARDS & OUT OF BOUNDS
Drop where the ball went out or crossed into the hazard, within 2 club lengths, no nearer the hole. Add 1 penalty stroke. No re-tees, no walk of shame.

2. MAX SCORE
Triple bogey max. Once you've hit triple, pick it up — your soul (and the group behind us) will thank you.

3. GIMMES
Inside the leather in casual play. In match play (Round 3), putts are only good when conceded by your opponent.

4. HANDICAPS
Full listed handicap, allocated by stroke index (hardest holes first). Scramble round is straight up — no strokes.

5. TIES
Tied net/gross finishes split the point values of the tied positions.

6. DISPUTES
The commissioner (JT) rules on all disputes. The commissioner may be bribed with beer.`;

export const DEFAULT_CONFIG = {
  players: DEFAULT_PLAYERS,
  teams: DEFAULT_TEAMS,
  courses: DEFAULT_COURSES,
  round1: DEFAULT_ROUND1,
  round2: DEFAULT_ROUND2,
  round3: DEFAULT_ROUND3,
  rules: DEFAULT_RULES,
  activeRound: 1,
};
