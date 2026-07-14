// Default (seed) configuration. Everything here is editable in Settings and
// stored in the Supabase `config` table. COURSES_VERSION forces a one-time
// upgrade of the courses config on databases seeded from older defaults.

export const COURSES_VERSION = 2;

const hole = (n, par, si, yds) => ({ hole: n, par, si, yds });

// Placeholder nine: par 4s, SI 1-9, no yardage — to be corrected on site.
const placeholderNine = () =>
  [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => hole(n, 4, n, null));

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
  version: COURSES_VERSION,
  paako: {
    name: 'Paako Ridge',
    nines: {
      // Nine 1 (holes 1-9): official card, Black tees — par 36, 3,727 yds.
      nine1: {
        name: 'Nine 1',
        verified: true,
        holes: [
          hole(1, 4, 13, 433),
          hole(2, 4, 11, 399),
          hole(3, 5, 5, 608),
          hole(4, 3, 17, 182),
          hole(5, 5, 7, 554),
          hole(6, 4, 15, 330),
          hole(7, 4, 1, 493),
          hole(8, 3, 9, 266),
          hole(9, 4, 3, 462),
        ],
      },
      // Nines 2 & 3: hole-by-hole card not published online (Nine 2 is
      // par 36 / 3,644 yds; Nine 3 is par 36 / 3,734 yds with three each of
      // par 3/4/5). Correct these from the printed card on site.
      nine2: { name: 'Nine 2', verified: false, holes: placeholderNine() },
      nine3: { name: 'Nine 3', verified: false, holes: placeholderNine() },
    },
  },
  // Black Mesa: official card, Black tees — par 72, 7,307 yds.
  blackmesa: {
    name: 'Black Mesa',
    verified: true,
    holes: [
      hole(1, 4, 7, 385),
      hole(2, 4, 11, 404),
      hole(3, 5, 1, 603),
      hole(4, 3, 13, 203),
      hole(5, 4, 3, 496),
      hole(6, 5, 15, 565),
      hole(7, 4, 17, 356),
      hole(8, 3, 5, 238),
      hole(9, 4, 9, 440),
      hole(10, 4, 6, 457),
      hole(11, 3, 18, 172),
      hole(12, 4, 12, 403),
      hole(13, 5, 8, 591),
      hole(14, 4, 16, 389),
      hole(15, 3, 14, 216),
      hole(16, 5, 4, 536),
      hole(17, 4, 2, 424),
      hole(18, 4, 10, 429),
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

const rulesBody = `1. HAZARDS & OUT OF BOUNDS
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

// Kept so databases whose rules text is still the old default get upgraded
// to the new title; user-edited rules are never touched.
export const LEGACY_RULES = `ZIA CUP — HOUSE RULES\n\n${rulesBody}`;
export const DEFAULT_RULES = `CUCK CUP — HOUSE RULES\n\n${rulesBody}`;

export const DEFAULT_CONFIG = {
  eventName: 'Cuck Cup',
  players: DEFAULT_PLAYERS,
  teams: DEFAULT_TEAMS,
  courses: DEFAULT_COURSES,
  round1: DEFAULT_ROUND1,
  round2: DEFAULT_ROUND2,
  round3: DEFAULT_ROUND3,
  rules: DEFAULT_RULES,
  activeRound: 1,
};
