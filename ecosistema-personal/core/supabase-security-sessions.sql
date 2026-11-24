-- Authenticated session status; no session identifiers or logs are committed.
-- The privileged reader stays in an unexposed schema. The public endpoint is SECURITY INVOKER.
create schema if not exists app_security;
revoke all on schema app_security from public, anon;
grant usage on schema app_security to authenticated;

create or replace function app_security.own_sessions()
returns table (
 session_id text, created_at timestamptz, last_seen_at timestamptz,
 ip_address text, device text, is_current boolean
)
language sql stable security definer set search_path = ''
as $$
 select s.id::text,
        s.created_at,
        greatest(s.updated_at,coalesce(s.refreshed_at at time zone 'UTC',s.updated_at)),
        case when s.ip is null then null else host(s.ip)::text end,
        left(coalesce(s.user_agent,''),250),
        s.id::text = nullif((select auth.jwt()->>'session_id'),'')
 from auth.sessions as s
 where (select auth.uid()) is not null
   and s.user_id = (select auth.uid())
 order by s.created_at desc
 limit 30
$$;
revoke all on function app_security.own_sessions() from public, anon;
grant execute on function app_security.own_sessions() to authenticated;

create or replace function public.my_security_sessions()
returns table (
 session_id text, created_at timestamptz, last_seen_at timestamptz,
 ip_address text, device text, is_current boolean
)
language sql stable security invoker set search_path = ''
as $$ select * from app_security.own_sessions() $$;
revoke all on function public.my_security_sessions() from public, anon;
grant execute on function public.my_security_sessions() to authenticated;
