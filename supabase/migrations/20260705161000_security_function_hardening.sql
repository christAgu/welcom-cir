-- Durcissement fonctions RLS
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.is_active_admin() from anon;
revoke execute on function public.current_admin_id() from anon;
