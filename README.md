# Enchantment Open — Golf Bachelor Party Scoreboard

A mobile-first, New Mexico–themed scoring app for an 8-man golf trip:
three rounds (individual net, 2-man scramble, 1v1 match play), live shared
data via Supabase realtime, deployable to Vercel.

- **Live/Home** — overall points standings across all rounds; the leader gets the Zia sun.
- **Card** — your own hole-by-hole entry (tap a score bubble or use +/−), with gross
  badges (circle = birdie, square = bogey, double square = double+), handicap stroke
  dots by stroke index, and net results.
- **Rounds** — full leaderboards: R1 individual net + team stat card, R2 scramble
  (gross), R3 match play with live status and auto-detected closeouts ("3&2").
- **Rules** — house rules, editable.
- **Settings** — everything is adjustable: players, handicaps, teams, groups,
  starting holes for late joiners, which two Paako nines you're playing, every
  hole's par and stroke index, point values, match strokes, rules text.

## 1. Local dev

```sh
npm install
cp .env.example .env   # fill in the two values (see step 2)
npm run dev
```

## 2. Supabase (free tier)

1. Go to [supabase.com](https://supabase.com) → sign in with GitHub → **New project**
   (any name, e.g. `enchantment-open`; pick a region near New Mexico, e.g. `us-west-1`;
   set any database password — you won't need it again).
2. When the project finishes provisioning, open **SQL Editor** → **New query**,
   paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql), and **Run**.
   This creates the `config` and `scores` tables, open access policies, and realtime.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`

The app seeds all default data (players, courses, points, rules) on first load.

> Note: the anon key is intentionally open read/write for this private trip app —
> don't reuse the Supabase project for anything else.

## 3. Vercel (free)

1. [vercel.com](https://vercel.com) → sign in with GitHub → **Add New → Project** →
   import this repo. Framework preset auto-detects as **Vite**.
2. Under **Environment Variables**, add `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` with the values from step 2.
3. **Deploy**. You'll get a URL like `https://enchantment-open.vercel.app` —
   text it to the group chat. Everyone picks their name on first open, and all
   scores/settings sync live to every phone.

## Scoring notes

- Handicap strokes are allocated by stroke index, hardest holes first. When two
  Paako nines are combined (or while placeholder indexes are in use), the 18 stored
  indexes are ranked to an effective 1–18, so per-nine 1–9 indexes work correctly.
- Round 1 points (net finish): 10/8/7/6/4/3/1/0 — ties split the tied positions' points.
- Round 1 team score: better net of the pair; if a team's "teammate isn't playing"
  toggle is on, it's the solo player's gross minus the **average** of both handicaps.
  Bonus points into overall standings are off by default (Settings).
- Round 2 scramble: gross only, 16/10/6/2, both teammates earn the points.
- Round 3 match play: strokes given on the hardest N holes; win 15 / halve 7.5 / loss 0.
  In-progress rounds show projected points on the Live tab.
