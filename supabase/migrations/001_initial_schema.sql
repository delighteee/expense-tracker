-- NairaLog initial schema
-- Run this in the Supabase SQL editor or via supabase db push

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- users
-- ============================================================
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  phone_wa    text,
  created_at  timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- ============================================================
-- transactions
-- ============================================================
create table if not exists public.transactions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  amount      numeric(12,2) not null,
  date        date not null,
  narration   text,
  beneficiary text,
  bank        text,
  category    text,
  direction   text not null default 'debit' check (direction in ('debit', 'credit')),
  image_ref   text,
  source      text not null default 'pwa',
  created_at  timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

create index transactions_user_id_date_idx on public.transactions(user_id, date desc);

-- ============================================================
-- user_category_corrections
-- ============================================================
create table if not exists public.user_category_corrections (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.users(id) on delete cascade,
  narration_pattern text not null,
  correct_category  text not null
);

alter table public.user_category_corrections enable row level security;

create policy "Users can manage own corrections"
  on public.user_category_corrections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- notification_prefs
-- ============================================================
create table if not exists public.notification_prefs (
  user_id      uuid primary key references public.users(id) on delete cascade,
  wa_weekly    boolean not null default true,
  wa_monthly   boolean not null default true,
  push_weekly  boolean not null default true,
  push_monthly boolean not null default true
);

alter table public.notification_prefs enable row level security;

create policy "Users can manage own notification prefs"
  on public.notification_prefs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- Trigger: auto-create user profile on sign up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.users (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
