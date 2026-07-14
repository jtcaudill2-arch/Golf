// Default (seed) configuration. Everything here is editable in Settings and
// stored in the Supabase `config` table. COURSES_VERSION forces a one-time
// upgrade of the courses config on databases seeded from older defaults.

export const COURSES_VERSION = 4;

// Yardage is stored per tee set: yds = { black: 433, blue: 410, ... }.
const hole = (n, par, si, blackYds) => ({
  hole: n,
  par,
  si,
  yds: blackYds != null ? { black: blackYds } : {},
});

// Paako hole from the official 2023 card: name, par, men's hcp, and yardage
// for all six tees (Black/Blue/Green/Brown/Gray/Turquoise).
const pk = (n, name, par, si, ...y) => ({
  hole: n,
  name,
  par,
  si,
  yds: { black: y[0], blue: y[1], green: y[2], brown: y[3], gray: y[4], turquoise: y[5] },
});

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
    // Real Paako tee sets (18-hole totals): Black 7,562 · Blue 7,218 ·
    // Green 6,727 · Brown 6,265 · Gray 5,755 · Turquoise 4,773.
    selectedTee: 'black',
    tees: [
      { id: 'black', name: 'Black' },
      { id: 'blue', name: 'Blue' },
      { id: 'green', name: 'Green' },
      { id: 'brown', name: 'Brown' },
      { id: 'gray', name: 'Gray' },
      { id: 'turquoise', name: 'Turquoise' },
    ],
    // All three nines from the official 2023 printed card.
    nines: {
      // Nine 1 (holes 1-9): par 36 — Black 3,727 yds.
      nine1: {
        name: 'Nine 1',
        verified: true,
        holes: [
          pk(1, 'Westward Ho!', 4, 13, 433, 414, 371, 349, 330, 290),
          pk(2, 'Narrow Passage', 4, 11, 399, 385, 360, 335, 315, 255),
          pk(3, 'Sandia', 5, 5, 608, 577, 542, 517, 452, 415),
          pk(4, 'Dye-abolical', 3, 17, 182, 166, 149, 123, 77, 77),
          pk(5, 'Santa Fe', 5, 7, 554, 542, 522, 504, 487, 420),
          pk(6, 'Gambler', 4, 15, 330, 312, 297, 280, 262, 192),
          pk(7, 'Field House', 4, 1, 493, 480, 448, 423, 409, 337),
          pk(8, 'Panorama', 3, 9, 266, 255, 237, 216, 200, 115),
          pk(9, 'Anasazi Ruin', 4, 3, 462, 443, 425, 395, 371, 315),
        ],
      },
      // Nine 2 (holes 10-18): par 36 — Black 3,835 yds.
      nine2: {
        name: 'Nine 2',
        verified: true,
        holes: [
          pk(1, 'Windmill Arroyo', 4, 10, 415, 404, 381, 360, 339, 245),
          pk(2, 'Deer Crossing', 4, 2, 453, 430, 370, 350, 335, 265),
          pk(3, 'Lone Ponderosa', 5, 14, 545, 527, 499, 478, 435, 355),
          pk(4, 'Serenity', 4, 16, 386, 367, 340, 317, 280, 280),
          pk(5, 'Cibola', 3, 8, 271, 245, 224, 200, 176, 108),
          pk(6, 'Turquoise Trail', 5, 4, 640, 624, 582, 545, 494, 441),
          pk(7, 'Agua Caliente', 3, 18, 230, 175, 154, 123, 104, 104),
          pk(8, 'The Ridge', 4, 12, 421, 408, 393, 356, 345, 272),
          pk(9, 'Trails End', 4, 6, 474, 464, 433, 394, 344, 287),
        ],
      },
      // Nine 3 (holes 19-27): par 36 — Black 3,876 yds.
      nine3: {
        name: 'Nine 3',
        verified: true,
        holes: [
          pk(1, 'Trail Head', 5, 5, 576, 557, 533, 484, 470, 405),
          pk(2, 'Ambush', 4, 7, 460, 444, 410, 390, 376, 305),
          pk(3, 'Wreckage', 4, 2, 456, 428, 410, 391, 371, 279),
          pk(4, 'Redan', 3, 8, 233, 212, 198, 187, 171, 110),
          pk(5, 'Muirfield', 5, 1, 628, 613, 583, 563, 478, 478),
          pk(6, 'Postage Stamp', 3, 9, 204, 191, 179, 156, 146, 146),
          pk(7, 'Waterloo', 5, 3, 567, 559, 521, 495, 481, 376),
          pk(8, 'Sanctuary', 3, 6, 256, 242, 225, 185, 172, 105),
          pk(9, 'Descent', 4, 4, 496, 488, 454, 423, 369, 273),
        ],
      },
    },
  },
  // Black Mesa: official card, Black tees — par 72, 7,307 yds.
  // The club has 5 tee boxes (5,157–7,307 yds); only Black publishes
  // hole-by-hole yardage. Rename the others to match the card on site.
  blackmesa: {
    name: 'Black Mesa',
    verified: true,
    selectedTee: 'black',
    tees: [
      { id: 'black', name: 'Black' },
      { id: 'tee2', name: 'Middle (rename)' },
      { id: 'tee3', name: 'Forward (rename)' },
    ],
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
