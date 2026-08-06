-- 냉장이 — Supabase 스키마 (Phase ② 인증/마이페이지 기준)
-- 02_technical_spec.md 의 users / characters 를 Supabase auth 위에 매핑.
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 Run 하세요.

-- =========================================================
-- 1. profiles  (auth.users 1:1 확장 — spec의 users 테이블)
-- =========================================================
create table if not exists public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  nickname          text,
  notification_pref text not null default 'normal'
                      check (notification_pref in ('quiet', 'normal', 'active')),
  notification_time time not null default '18:00',
  currency_balance  int  not null default 0,   -- 콩알 잔액 (원장은 추후 currency_transactions)
  created_at        timestamptz not null default now()
);

-- =========================================================
-- 2. characters  (사용자당 1:1)
-- =========================================================
create table if not exists public.characters (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references auth.users (id) on delete cascade,
  type            text not null default 'default',
  name            text,
  growth_stage    text not null default 'baby'
                    check (growth_stage in ('baby', 'child', 'teen', 'young_adult', 'adult')),
  condition_score int  not null default 50,
  created_at      timestamptz not null default now()
);

-- =========================================================
-- 3. RLS — 각자 본인 행만 접근
-- =========================================================
alter table public.profiles   enable row level security;
alter table public.characters enable row level security;

create policy "본인 프로필 조회" on public.profiles
  for select using (auth.uid() = id);
create policy "본인 프로필 수정" on public.profiles
  for update using (auth.uid() = id);

create policy "본인 캐릭터 조회" on public.characters
  for select using (auth.uid() = user_id);
create policy "본인 캐릭터 수정" on public.characters
  for update using (auth.uid() = user_id);

-- =========================================================
-- 4. 회원가입 시 profile + character 자동 생성 트리거
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
    values (new.id, split_part(new.email, '@', 1));
  insert into public.characters (user_id)
    values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- 5. ingredient_dictionary (표준 식재료 사전 — Phase 3)
-- =========================================================
create table if not exists public.ingredient_dictionary (
  id                  uuid primary key default gen_random_uuid(),
  standard_name       text not null unique,
  category            text not null,
  default_expiry_days int  not null default 7,
  aliases             text[] not null default '{}',
  created_at          timestamptz not null default now()
);

alter table public.ingredient_dictionary enable row level security;

create policy "누구나 사전 조회 가능" on public.ingredient_dictionary
  for select using (true);

-- =========================================================
-- 6. inventory_items (사용자 보유 식재료 — Phase 3)
-- =========================================================
create table if not exists public.inventory_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  category    text not null,
  storage     text not null check (storage in ('fridge', 'freezer', 'pantry')),
  quantity    text not null default '1개',
  expiry_date date not null,
  added_date  date not null default current_date,
  note        text,
  created_at  timestamptz not null default now()
);

alter table public.inventory_items enable row level security;

create policy "본인 식재료 조회" on public.inventory_items
  for select using (auth.uid() = user_id);
create policy "본인 식재료 생성" on public.inventory_items
  for insert with check (auth.uid() = user_id);
create policy "본인 식재료 수정" on public.inventory_items
  for update using (auth.uid() = user_id);
create policy "본인 식재료 삭제" on public.inventory_items
  for delete using (auth.uid() = user_id);

-- =========================================================
-- 7. recipes (AI 레시피 및 마스터 레시피 — Phase 3)
-- =========================================================
create table if not exists public.recipes (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  category     text not null,
  cooking_time int not null default 15,
  difficulty   text not null check (difficulty in ('쉬움', '보통', '어려움')),
  image_url    text,
  ingredients  jsonb not null default '[]'::jsonb,
  steps        text[] not null default '{}',
  created_at   timestamptz not null default now()
);

alter table public.recipes enable row level security;

create policy "누구나 레시피 조회 가능" on public.recipes
  for select using (true);

