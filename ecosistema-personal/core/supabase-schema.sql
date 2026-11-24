-- Mi Ecosistema: private snapshots, isolated by authenticated Supabase user.
-- Run in your own Supabase project. Never publish backups, tokens, or private records.
create table if not exists public.app_snapshots (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  app_id text not null check (app_id ~ '^[a-z0-9-]{1,48}$'),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  revision bigint not null default 1 check (revision >= 1),
  updated_at timestamptz not null default now(),
  primary key (owner_id, app_id)
);
alter table public.app_snapshots enable row level security;
revoke all on public.app_snapshots from public, anon;
grant select, insert, update on public.app_snapshots to authenticated;
drop policy if exists "snapshots_select_own" on public.app_snapshots;
drop policy if exists "snapshots_insert_own" on public.app_snapshots;
drop policy if exists "snapshots_update_own" on public.app_snapshots;
create policy "snapshots_select_own" on public.app_snapshots for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy "snapshots_insert_own" on public.app_snapshots for insert to authenticated
  with check ((select auth.uid()) = owner_id);
create policy "snapshots_update_own" on public.app_snapshots for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

-- Revision-aware atomic writes: prevents a stale device from silently overwriting newer data.
create or replace function public.save_app_snapshot(
  p_app_id text, p_payload jsonb, p_expected_revision bigint
)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare v_revision bigint;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_app_id is null or p_app_id !~ '^[a-z0-9-]{1,48}$' then
    raise exception 'Invalid app identifier' using errcode = '22023';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Invalid snapshot payload' using errcode = '22023';
  end if;
  if p_expected_revision = 0 then
    insert into public.app_snapshots(owner_id,app_id,payload,revision)
    values ((select auth.uid()), p_app_id, p_payload, 1)
    on conflict (owner_id,app_id) do nothing
    returning revision into v_revision;
  elsif p_expected_revision > 0 then
    update public.app_snapshots
      set payload = p_payload, revision = revision + 1, updated_at = now()
      where owner_id = (select auth.uid())
        and app_id = p_app_id
        and revision = p_expected_revision
      returning revision into v_revision;
  end if;
  if v_revision is null then
    raise exception 'Version conflict. Refresh and resolve before writing.' using errcode = 'P0001';
  end if;
  return v_revision;
end;
$$;
revoke all on function public.save_app_snapshot(text,jsonb,bigint) from public, anon;
grant execute on function public.save_app_snapshot(text,jsonb,bigint) to authenticated;
