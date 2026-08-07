-- Inscription ouverte : profil admin auto-créé à l'inscription Auth.
-- Super admin : gestion et suppression des comptes admin.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admins (user_id, name, role, is_active)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), split_part(new.email, '@', 1)),
    'admin',
    true
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_super_admin()
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
      and role = 'super_admin'
      and is_active = true
  );
$$;

revoke all on function public.is_super_admin() from public;
grant execute on function public.is_super_admin() to authenticated;
revoke execute on function public.is_super_admin() from anon;

drop policy if exists "admins_super_admin_select_all" on public.admins;
create policy "admins_super_admin_select_all"
  on public.admins for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_super_admin()
  );

drop policy if exists "admins_select_own" on public.admins;
drop policy if exists "admins_super_admin_update" on public.admins;
create policy "admins_super_admin_update"
  on public.admins for update
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_super_admin()
  )
  with check (
    user_id = auth.uid()
    or public.is_super_admin()
  );

drop policy if exists "admins_update_own_profile" on public.admins;

drop policy if exists "admins_super_admin_delete" on public.admins;
create policy "admins_super_admin_delete"
  on public.admins for delete
  to authenticated
  using (
    public.is_super_admin()
    and user_id <> auth.uid()
  );
