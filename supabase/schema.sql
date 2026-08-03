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
