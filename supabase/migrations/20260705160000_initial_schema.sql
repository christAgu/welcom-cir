-- CIR Welcom — schéma initial
-- Tables : admins, field_definitions, visitors
-- RLS : accès réservé aux admins actifs

-- ─── Extensions ─────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── Enums ──────────────────────────────────────────────────────────────────
do $$ begin
  create type public.admin_role as enum ('admin', 'super_admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.culte_type as enum ('dim', 'mer');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.field_type as enum (
    'text', 'email', 'phone', 'date', 'textarea', 'select', 'checkbox'
  );
exception
  when duplicate_object then null;
end $$;

-- ─── Admins ─────────────────────────────────────────────────────────────────
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  name text not null,
  is_active boolean not null default false,
  role public.admin_role not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admins_user_id_idx on public.admins (user_id);
create index if not exists admins_is_active_idx on public.admins (is_active);

-- ─── Champs formulaire dynamiques ───────────────────────────────────────────
create table if not exists public.field_definitions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  field_type public.field_type not null default 'text',
  options jsonb,
  required boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists field_definitions_sort_idx
  on public.field_definitions (sort_order)
  where is_active = true;

-- ─── Visiteurs ──────────────────────────────────────────────────────────────
create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  culte_date date not null,
  culte_type public.culte_type not null default 'dim',
  data jsonb not null default '{}'::jsonb,
  visited_at timestamptz,
  called_at timestamptz,
  returned_at timestamptz,
  registered_by uuid references public.admins (id) on delete set null,
  updated_by uuid references public.admins (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists visitors_culte_date_idx on public.visitors (culte_date desc);
create index if not exists visitors_culte_type_date_idx
  on public.visitors (culte_type, culte_date desc);
create index if not exists visitors_registered_by_idx on public.visitors (registered_by);

-- ─── Triggers updated_at ────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists admins_set_updated_at on public.admins;
create trigger admins_set_updated_at
  before update on public.admins
  for each row execute function public.set_updated_at();

drop trigger if exists visitors_set_updated_at on public.visitors;
create trigger visitors_set_updated_at
  before update on public.visitors
  for each row execute function public.set_updated_at();

-- ─── Helpers RLS (security definer, schéma public) ────────────────────────
create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins
    where user_id = auth.uid()
      and is_active = true
  );
$$;

create or replace function public.current_admin_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.admins
  where user_id = auth.uid()
    and is_active = true
  limit 1;
$$;

revoke all on function public.is_active_admin() from public;
revoke all on function public.current_admin_id() from public;
grant execute on function public.is_active_admin() to authenticated;
grant execute on function public.current_admin_id() to authenticated;

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table public.admins enable row level security;
alter table public.field_definitions enable row level security;
alter table public.visitors enable row level security;

-- Admins : lire son propre profil ; super_admin lit tout
drop policy if exists "admins_select_own" on public.admins;
create policy "admins_select_own"
  on public.admins for select
  to authenticated
  using (
    user_id = auth.uid()
    or (
      public.is_active_admin()
      and exists (
        select 1 from public.admins me
        where me.user_id = auth.uid()
          and me.role = 'super_admin'
          and me.is_active = true
      )
    )
  );

drop policy if exists "admins_update_own_profile" on public.admins;
create policy "admins_update_own_profile"
  on public.admins for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Champs : lecture pour admins actifs ; écriture super_admin
drop policy if exists "field_definitions_select" on public.field_definitions;
create policy "field_definitions_select"
  on public.field_definitions for select
  to authenticated
  using (public.is_active_admin());

drop policy if exists "field_definitions_write" on public.field_definitions;
create policy "field_definitions_write"
  on public.field_definitions for all
  to authenticated
  using (
    exists (
      select 1 from public.admins
      where user_id = auth.uid()
        and role = 'super_admin'
        and is_active = true
    )
  )
  with check (
    exists (
      select 1 from public.admins
      where user_id = auth.uid()
        and role = 'super_admin'
        and is_active = true
    )
  );

-- Visiteurs : CRUD pour admins actifs
drop policy if exists "visitors_select" on public.visitors;
create policy "visitors_select"
  on public.visitors for select
  to authenticated
  using (public.is_active_admin());

drop policy if exists "visitors_insert" on public.visitors;
create policy "visitors_insert"
  on public.visitors for insert
  to authenticated
  with check (public.is_active_admin());

drop policy if exists "visitors_update" on public.visitors;
create policy "visitors_update"
  on public.visitors for update
  to authenticated
  using (public.is_active_admin())
  with check (public.is_active_admin());

drop policy if exists "visitors_delete" on public.visitors;
create policy "visitors_delete"
  on public.visitors for delete
  to authenticated
  using (public.is_active_admin());

-- ─── Données initiales (champs formulaire) ──────────────────────────────────
insert into public.field_definitions (key, label, field_type, required, sort_order)
values
  ('full_name', 'Nom complet', 'text', true, 10),
  ('email', 'Email', 'email', false, 20),
  ('phone', 'Téléphone', 'phone', false, 30),
  ('address', 'Adresse', 'textarea', false, 40),
  ('notes', 'Notes', 'textarea', false, 50)
on conflict (key) do nothing;
