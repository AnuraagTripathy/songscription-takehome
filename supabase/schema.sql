-- Songscription take-home — catalogue schema
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).

-- ---------------------------------------------------------------------------
-- Storage: the .mid binaries themselves.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('midi', 'midi', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- pieces
--
-- Three groups of columns, deliberately kept apart:
--
--   1. identity      — what the file is and where it lives
--   2. measured      — read out of the MIDI itself, never invented. These are
--                      what the interface uses to tell a learner how hard a
--                      piece is, so they have to be reproducible from the file.
--   3. the user's    — the layer the app writes as you practise. Seeded with
--      own layer       plausible values for the demo (the brief permits mock
--                      data) and never presented as a measured accuracy score.
-- ---------------------------------------------------------------------------

create table if not exists public.pieces (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),

  -- 1. identity
  title                   text        not null,
  composer                text,
  source_filename         text        not null,
  storage_path            text        not null unique,
  file_size_bytes         integer     not null check (file_size_bytes > 0),
  -- sha-256 of the bytes. Uploading the same file twice is a mistake we can
  -- catch before it becomes a duplicate row, so it is unique rather than an
  -- afterthought in application code.
  checksum                text        not null unique,

  -- 2. measured from the file
  duration_seconds        numeric     not null check (duration_seconds > 0),
  tempo_bpm               numeric,
  time_signature          text,
  key_signature           text,
  key_is_estimated        boolean     not null default true,
  note_count              integer     not null check (note_count > 0),
  lowest_note             smallint    not null check (lowest_note between 0 and 127),
  highest_note            smallint    not null check (highest_note between 0 and 127),
  distinct_pitch_count    smallint    not null,
  max_simultaneous_notes  smallint    not null,
  notes_per_second        numeric     not null,
  black_key_fraction      numeric     not null,
  track_count             smallint    not null,
  two_hands               boolean     not null,
  two_hands_basis         text        not null,
  difficulty              smallint    not null check (difficulty between 1 and 5),
  -- the receipts: which measurements produced that difficulty, and how much
  -- each one contributed. The detail view renders this, so the score is never
  -- a number the user has to take on faith.
  difficulty_factors      jsonb       not null default '[]'::jsonb,
  -- every note as [startPermille, midiNote, lengthPermille]; the thumbnail is
  -- the real note field rather than a chart about it
  pitch_map               jsonb       not null default '[]'::jsonb,

  -- 3. the user's own layer
  -- the one thing about a piece the file cannot measure: "bar 24, LH crosses"
  notes                   text,
  in_progress            boolean     not null default false,
  is_favourite            boolean     not null default false,
  last_practiced_at       timestamptz,
  practice_seconds        integer     not null default 0 check (practice_seconds >= 0),
  session_count           integer     not null default 0 check (session_count >= 0),

  constraint pieces_range_ordered check (highest_note >= lowest_note)
);

-- ---------------------------------------------------------------------------
-- Indexes.
--
-- Being honest about which of these earn their keep TODAY: the app issues one
-- query — the whole catalogue, newest first — and does its searching, filtering
-- and sorting in the browser over rows it already has. That is the right shape
-- at this size: filtering in memory is instant and costs no round trip, and a
-- library measured at 5.5 KB a row stays comfortable into the low hundreds.
--
-- So two indexes are load-bearing: created_at, and the search GIN below.
-- The rest are written for the
-- query shapes the app moves to when the grid starts paginating (see the
-- ceiling noted in src/app/page.tsx) and are marked as such rather than left
-- to look like they are doing something.
-- ---------------------------------------------------------------------------

-- LOAD-BEARING. The only query the app runs: order by created_at desc.
create index if not exists pieces_created_at_idx
  on public.pieces (created_at desc);

-- Provisioned, not yet used. Partial, because only a handful of pieces are
-- ever favourited or on the bench and there is no reason to index the rest.
create index if not exists pieces_favourite_idx
  on public.pieces (last_practiced_at desc nulls last)
  where is_favourite;

create index if not exists pieces_in_progress_idx
  on public.pieces (last_practiced_at desc nulls last)
  where in_progress;

-- Provisioned, not yet used: difficulty filter + newest-first sort.
create index if not exists pieces_difficulty_idx
  on public.pieces (difficulty, created_at desc);

-- ---------------------------------------------------------------------------
-- Search.
--
-- LOAD-BEARING: /api/pieces?q= matches against this index.
--
-- to_tsvector('simple', 'Für Elise') indexes 'für', so a search for "fur" —
-- which is what people type, and what the filename says — matched nothing. The
-- fix is to fold accents on both sides. unaccent(text) is STABLE, because it
-- resolves its dictionary through search_path, so it cannot appear in a
-- generated column; the two-argument form that names the dictionary is
-- IMMUTABLE, and that is what this wrapper exposes.
--
-- A generated column rather than a trigger, so the tsvector can never drift
-- out of sync with the text it indexes. It is deliberately excluded from
-- PIECE_COLUMNS — a tsvector is for Postgres to match on, not for a browser to
-- download.
-- ---------------------------------------------------------------------------

create extension if not exists unaccent with schema extensions;

create or replace function public.f_unaccent(text)
  returns text
  language sql
  immutable
  parallel safe
  strict
  set search_path = ''
as $$ select extensions.unaccent('extensions.unaccent'::regdictionary, $1) $$;

alter table public.pieces drop column if exists search_vector;

-- Weighted A/B/C: the title is the strongest signal, the filename the weakest
-- but still worth having — months later "that bach file I downloaded" is the
-- only handle a person has left on it.
alter table public.pieces
  add column search_vector tsvector
  generated always as (
    setweight(to_tsvector('simple', public.f_unaccent(coalesce(title, ''))), 'A') ||
    setweight(to_tsvector('simple', public.f_unaccent(coalesce(composer, ''))), 'B') ||
    setweight(
      to_tsvector('simple', public.f_unaccent(translate(coalesce(source_filename, ''), '-_.', '   '))),
      'C'
    )
  ) stored;

create index if not exists pieces_search_idx
  on public.pieces using gin (search_vector);

-- ---------------------------------------------------------------------------
-- Row level security.
--
-- The brief says no auth: treat this as a single user. RLS is still switched on
-- rather than left off, because a table with RLS disabled and a public anon key
-- is world-writable, and the habit of shipping that is worse than the shortcut.
-- With auth, the policy below would become `using (owner_id = auth.uid())` and
-- the table would carry an `owner_id uuid references auth.users`.
-- ---------------------------------------------------------------------------

alter table public.pieces enable row level security;

drop policy if exists "single user demo: full access" on public.pieces;
create policy "single user demo: full access"
  on public.pieces for all
  using (true)
  with check (true);

drop policy if exists "single user demo: read midi" on storage.objects;
create policy "single user demo: read midi"
  on storage.objects for select
  using (bucket_id = 'midi');
