-- Enchantment Open — Supabase schema
-- Run this once in your Supabase project: SQL Editor -> New query -> paste -> Run.

-- Key/value store for all adjustable settings (players, teams, courses,
-- point values, rules text, round setup). The app seeds defaults on first load.
create table if not exists config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- One row per (round, player-or-team, hole). strokes = gross strokes.
create table if not exists scores (
  round_id int not null,
  entity_id text not null,
  hole int not null,
  strokes int,
  updated_at timestamptz not null default now(),
  primary key (round_id, entity_id, hole)
);

-- This is a private app for 8 friends using the public anon key, so the
-- policies are wide open. Don't reuse this project for anything sensitive.
alter table config enable row level security;
alter table scores enable row level security;

drop policy if exists "anon full access config" on config;
create policy "anon full access config" on config
  for all using (true) with check (true);

drop policy if exists "anon full access scores" on scores;
create policy "anon full access scores" on scores
  for all using (true) with check (true);

-- Realtime: broadcast row changes so every phone updates live.
do $$
begin
  begin
    alter publication supabase_realtime add table config;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table scores;
  exception when duplicate_object then null;
  end;
end $$;
