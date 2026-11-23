-- Run this entire file in Supabase SQL Editor. Safe to rerun.
begin;
alter table public.projects add column if not exists pills text[] not null default array['UI Design','UX Design'];
alter table public.projects add column if not exists sort_order integer not null default 2147483647;
create or replace function public.valid_project_pills(items text[]) returns boolean language sql immutable set search_path='' as $pills$
 select cardinality(items)<=3 and not exists(select 1 from unnest(items) item where item is null or length(trim(item)) not between 1 and 32);
$pills$;
alter table public.projects drop constraint if exists projects_pills_check;
alter table public.projects add constraint projects_pills_check check(public.valid_project_pills(pills));
create table if not exists public.site_content (
 section text primary key check(section in ('experience','testimonials','faqs')),
 items jsonb not null default '[]',
 updated_at timestamptz not null default now(),
 check(jsonb_typeof(items)='array' and jsonb_array_length(items)<=100)
);
create or replace function public.validate_site_content() returns trigger language plpgsql set search_path='' as $content_validation$
declare item jsonb; field text; required_fields text[];
begin
 required_fields:=case new.section when 'experience' then array['company','role','dates','description'] when 'testimonials' then array['name','role','quote'] else array['question','answer'] end;
 for item in select value from jsonb_array_elements(new.items) loop
  foreach field in array required_fields loop
   if jsonb_typeof(item->field) is distinct from 'string' or length(trim(item->>field)) not between 1 and 10000 then raise exception 'Content fields are required and must contain 1–10000 characters'; end if;
  end loop;
 end loop;
 new.updated_at:=now(); return new;
end; $content_validation$;
drop trigger if exists validate_site_content on public.site_content;
create trigger validate_site_content before insert or update on public.site_content for each row execute function public.validate_site_content();
alter table public.site_content enable row level security;
grant select on public.site_content to anon, authenticated;
grant insert,update,delete on public.site_content to authenticated;
drop policy if exists "Read website content" on public.site_content;
create policy "Read website content" on public.site_content for select to anon,authenticated using(true);
drop policy if exists "Admins edit website content" on public.site_content;
create policy "Admins edit website content" on public.site_content for all to authenticated using((select public.is_portfolio_admin())) with check((select public.is_portfolio_admin()));
create or replace function public.reorder_portfolio(project_ids uuid[]) returns void language plpgsql security invoker set search_path='' as $portfolio_order$
begin
 if not public.is_portfolio_admin() then raise exception 'Admin access required'; end if;
 lock table public.projects in share row exclusive mode;
 if project_ids is null or cardinality(project_ids) <> (select count(*) from public.projects where status='published')
 or cardinality(project_ids) <> (select count(distinct id) from unnest(project_ids) id)
 or exists(select 1 from unnest(project_ids) as submitted(id) where not exists(select 1 from public.projects p where p.id=submitted.id and p.status='published')) then
 raise exception 'Published projects changed. Reload the portfolio and try again.';
 end if;
 update public.projects p set sort_order=ordered.position::integer from unnest(project_ids) with ordinality as ordered(id,position) where p.id=ordered.id;
end; $portfolio_order$;
revoke all on function public.reorder_portfolio(uuid[]) from public;
grant execute on function public.reorder_portfolio(uuid[]) to authenticated;
commit;
