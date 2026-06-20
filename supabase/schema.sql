-- ============================================================================
-- PassGo — Supabase schema
-- Run in the Supabase SQL editor (or `supabase db reset` with this in migrations).
-- Mirrors the TypeScript types in src/types/index.ts.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────────────────────
do $$ begin
  create type visa_type as enum (
    'visa_free', 'visa_on_arrival', 'evisa', 'eta', 'visa_required'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type budget_tier as enum ('budget', 'moderate', 'luxury');
exception when duplicate_object then null; end $$;

-- ── Reference data (publicly readable) ───────────────────────────────────────
create table if not exists countries (
  id              text primary key,
  code            text unique not null,          -- ISO 3166-1 alpha-2
  name            text not null,
  flag            text not null,                 -- emoji
  region          text not null,
  capital         text not null,
  currency        text not null,                 -- ISO 4217
  currency_name   text not null,
  languages       text[] not null default '{}',
  daily_budget_usd integer not null default 0,
  budget_tier     budget_tier not null default 'moderate',
  suggested_days  integer not null default 5,
  best_season     text,
  hero_image      text,
  summary         text,
  popularity_rank integer not null default 999
);

create table if not exists cities (
  id             text primary key,
  country_code   text not null references countries(code) on delete cascade,
  name           text not null,
  lat            double precision not null,
  lng            double precision not null,
  image          text,
  blurb          text,
  suggested_days integer not null default 1
);
create index if not exists cities_country_idx on cities(country_code);

create table if not exists attractions (
  id             text primary key,
  city_id        text not null references cities(id) on delete cascade,
  name           text not null,
  category       text,
  image          text,
  lat            double precision not null,
  lng            double precision not null,
  opening_hours  text,
  fee_usd        numeric(8,2) not null default 0,
  rating         numeric(2,1) not null default 0,
  duration_hours numeric(4,1) not null default 1,
  blurb          text
);
create index if not exists attractions_city_idx on attractions(city_id);

create table if not exists visa_rules (
  id               text primary key,
  passport_country text not null,                -- ISO alpha-2 of traveller
  dest_country     text not null references countries(code) on delete cascade,
  visa_type        visa_type not null,
  cost_usd         numeric(8,2) not null default 0,
  processing_days  integer not null default 0,
  stay_days        integer not null default 0,
  official_link    text,
  notes            text,
  unique (passport_country, dest_country)
);
create index if not exists visa_rules_passport_idx on visa_rules(passport_country);

create table if not exists prep_guides (
  dest_country  text primary key references countries(code) on delete cascade,
  documents     text[] not null default '{}',
  vaccinations  text[] not null default '{}',
  currency      jsonb  not null default '{}',
  sim           jsonb  not null default '{}',
  safety        text[] not null default '{}',
  premium       boolean not null default true
);

-- ── User data (row-level secured) ────────────────────────────────────────────
create table if not exists user_trips (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  country_code  text not null,
  title         text not null,
  start_date    date,
  end_date      date,
  accommodation text,
  items         jsonb not null default '[]',     -- TripItem[]
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists user_trips_user_idx on user_trips(user_id);

create table if not exists user_profiles (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  passport_country     text,
  is_premium           boolean not null default false,
  visited_codes        text[] not null default '{}',
  bucket_list_codes    text[] not null default '{}',
  updated_at           timestamptz not null default now()
);

-- ── Row Level Security ───────────────────────────────────────────────────────
-- Reference tables: read-only to everyone (incl. anon).
alter table countries    enable row level security;
alter table cities       enable row level security;
alter table attractions  enable row level security;
alter table visa_rules   enable row level security;
alter table prep_guides  enable row level security;

do $$ begin
  create policy "public read countries"   on countries   for select using (true);
  create policy "public read cities"       on cities       for select using (true);
  create policy "public read attractions"  on attractions  for select using (true);
  create policy "public read visa_rules"   on visa_rules   for select using (true);
  create policy "public read prep_guides"  on prep_guides  for select using (true);
exception when duplicate_object then null; end $$;

-- User tables: each user sees and edits only their own rows.
alter table user_trips    enable row level security;
alter table user_profiles enable row level security;

do $$ begin
  create policy "own trips"   on user_trips
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  create policy "own profile" on user_profiles
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
