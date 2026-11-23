-- Run once in the Supabase SQL Editor for a NEW portfolio project.
begin;
create table if not exists public.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.portfolio_admins enable row level security;
revoke all on public.portfolio_admins from anon, authenticated;

create or replace function public.is_portfolio_admin()
returns boolean language sql stable security definer
set search_path = ''
as $$ select exists(select 1 from public.portfolio_admins where user_id = (select auth.uid())); $$;
revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to anon, authenticated;

create or replace function public.portfolio_word_count(value text)
returns integer language sql immutable set search_path = ''
as $$ select count(*)::integer from regexp_split_to_table(trim(value), E'\\s+') as word where word <> ''; $$;

create or replace function public.valid_portfolio_slides(items jsonb, project_id uuid)
returns boolean language plpgsql immutable set search_path = '' as $$
declare item jsonb;
begin
  if jsonb_typeof(items) <> 'array' or jsonb_array_length(items) > 50 then return false; end if;
  for item in select value from jsonb_array_elements(items) loop
    if jsonb_typeof(item) <> 'object' or item->>'path' is null
       or item->>'path' not like project_id::text || '/%'
       or item ? 'url' or item ? 'blob' then return false; end if;
  end loop;
  return true;
end $$;

create table if not exists public.projects (
  id uuid primary key,
  title text not null check (length(trim(title)) between 1 and 160),
  description text not null default '' check (public.portfolio_word_count(description) <= 2000),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  hero_slot integer check (hero_slot between 1 and 5),
  stack_slot integer check (stack_slot between 1 and 4),
  thumbnail_path text check (thumbnail_path like id::text || '/%'),
  slides jsonb not null default '[]'::jsonb check (public.valid_portfolio_slides(slides,id)),
  updated_at timestamptz not null default now(),
  check (status <> 'published' or (thumbnail_path is not null and jsonb_array_length(slides) > 0))
);
create unique index if not exists projects_hero_slot_unique on public.projects(hero_slot) where status='published';
create unique index if not exists projects_stack_slot_unique on public.projects(stack_slot) where status='published';
alter table public.projects enable row level security;
grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;
create policy "Visitors read published projects" on public.projects for select to anon, authenticated using (status='published');
create policy "Admins manage projects" on public.projects for all to authenticated
using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('project-media','project-media',false,20971520,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=20971520,allowed_mime_types=excluded.allowed_mime_types;
create policy "Portfolio media admin access" on storage.objects for all to authenticated
using (bucket_id='project-media' and (select public.is_portfolio_admin()))
with check (bucket_id='project-media' and (select public.is_portfolio_admin()));
create policy "Visitors read published project images" on storage.objects for select to anon, authenticated
using (bucket_id='project-media' and exists (
  select 1 from public.projects p where p.status='published'
  and (p.thumbnail_path=name or p.slides @> jsonb_build_array(jsonb_build_object('path',name)))
));
commit;

-- AFTER creating your user in Authentication > Users, run separately:
-- insert into public.portfolio_admins(user_id) values ('YOUR-AUTH-USER-UUID');
