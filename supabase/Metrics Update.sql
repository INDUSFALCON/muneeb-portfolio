-- Run this entire file once in Supabase SQL Editor.
begin;

create table if not exists public.daily_page_views (
  view_date date primary key default current_date,
  page_views bigint not null default 0 check (page_views >= 0),
  updated_at timestamptz not null default now()
);

alter table public.daily_page_views enable row level security;
revoke all on table public.daily_page_views from anon, authenticated;

create or replace function public.record_landing_page_view()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.daily_page_views (view_date, page_views, updated_at)
  values (current_date, 1, now())
  on conflict (view_date) do update
    set page_views = public.daily_page_views.page_views + 1,
        updated_at = now();
end;
$$;

create or replace function public.get_landing_page_metrics()
returns table (
  view_date date,
  page_views bigint,
  total_page_views bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    metric.view_date,
    metric.page_views,
    coalesce(sum(metric.page_views) over (), 0)::bigint as total_page_views
  from public.daily_page_views as metric
  where (select public.is_portfolio_admin())
  order by metric.view_date desc;
$$;

revoke all on function public.record_landing_page_view() from public;
grant execute on function public.record_landing_page_view() to anon, authenticated;
revoke all on function public.get_landing_page_metrics() from public;
grant execute on function public.get_landing_page_metrics() to authenticated;

commit;
