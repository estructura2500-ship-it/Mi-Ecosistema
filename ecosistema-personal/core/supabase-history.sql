-- Private daily restore points (applied 2026-11-24).
-- At most 14 distinct change days are retained per user/app; no personal data is stored in this migration.
create table if not exists public.app_snapshot_history (
  owner_id uuid not null references auth.users(id) on delete cascade,
  app_id text not null check (app_id ~ '^[a-z0-9-]{1,48}$'),
  backup_day date not null,
  revision bigint not null check (revision >= 1),
  payload jsonb not null check (jsonb_typeof(payload)='object'),
  saved_at timestamptz not null default now(),
  primary key (owner_id, app_id, backup_day)
);
alter table public.app_snapshot_history enable row level security;
revoke all on public.app_snapshot_history from public, anon;
grant select, insert, delete on public.app_snapshot_history to authenticated;
drop policy if exists snapshot_history_select_own on public.app_snapshot_history;
drop policy if exists snapshot_history_insert_own on public.app_snapshot_history;
drop policy if exists snapshot_history_delete_own on public.app_snapshot_history;
create policy snapshot_history_select_own on public.app_snapshot_history
  for select to authenticated using ((select auth.uid())=owner_id);
create policy snapshot_history_insert_own on public.app_snapshot_history
  for insert to authenticated with check ((select auth.uid())=owner_id);
create policy snapshot_history_delete_own on public.app_snapshot_history
  for delete to authenticated using ((select auth.uid())=owner_id);

create or replace function public.archive_app_snapshot_before_update()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  local_day date := (now() at time zone 'America/Bogota')::date;
begin
  if new.payload is distinct from old.payload then
    insert into public.app_snapshot_history(owner_id,app_id,backup_day,revision,payload)
      values(old.owner_id,old.app_id,local_day,old.revision,old.payload)
      on conflict (owner_id,app_id,backup_day) do nothing;
    delete from public.app_snapshot_history
      where owner_id=old.owner_id and app_id=old.app_id
        and backup_day not in (
          select backup_day from public.app_snapshot_history
          where owner_id=old.owner_id and app_id=old.app_id
          order by backup_day desc limit 14
        );
  end if;
  return new;
end;
$$;
revoke all on function public.archive_app_snapshot_before_update() from public, anon;
drop trigger if exists archive_private_snapshot_on_change on public.app_snapshots;
create trigger archive_private_snapshot_on_change
  before update on public.app_snapshots
  for each row execute function public.archive_app_snapshot_before_update();
