-- Copy ALL contents into a new Supabase SQL Editor query, then Run.
-- Extends the existing content manager; does not delete existing content.
begin;
alter table public.site_content drop constraint if exists site_content_section_check;
alter table public.site_content add constraint site_content_section_check check(section in ('experience','testimonials','faqs','companies','skills','introduction','process','profile'));
create or replace function public.validate_site_content() returns trigger language plpgsql set search_path='' as $content_fields$
declare item jsonb; field text; required_fields text[]; max_items integer;
begin
 max_items:=case new.section when 'companies' then 20 when 'process' then 4 when 'introduction' then 1 when 'profile' then 1 else 100 end;
 if jsonb_typeof(new.items)<>'array' or jsonb_array_length(new.items)>max_items then raise exception 'Too many entries for this section (maximum %)',max_items; end if;
 required_fields:=case new.section
 when 'experience' then array['company','role','dates','description']
 when 'testimonials' then array['name','role','quote']
 when 'faqs' then array['question','answer']
 when 'companies' then array['name']
 when 'profile' then array['name']
 when 'skills' then array['name']
 when 'introduction' then array['heading','description']
 when 'process' then array['title','text']
 else array[]::text[] end;
 for item in select value from jsonb_array_elements(new.items) loop
  foreach field in array required_fields loop
   if jsonb_typeof(item->field) is distinct from 'string' or length(trim(item->>field)) not between 1 and 10000 then raise exception 'Required content fields must contain 1–10000 characters'; end if;
  end loop;
  if new.section in ('companies','testimonials','profile') and item->'logo' is not null and item->'logo'<>'null'::jsonb then
   if jsonb_typeof(item->'logo')<>'object' or item->'logo'->>'path' is null or item->'logo'->>'path' not like new.section || '/%' then raise exception 'Company logo must be an uploaded site-media image'; end if;
  end if;
 end loop;
 new.updated_at:=now();return new;
end;
$content_fields$;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('site-media','site-media',false,5242880,array['image/webp','image/png','image/jpeg'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Admins manage company logos" on storage.objects;
create policy "Admins manage company logos" on storage.objects for all to authenticated
using(bucket_id='site-media' and (select public.is_portfolio_admin()))
with check(bucket_id='site-media' and (select public.is_portfolio_admin()));
drop policy if exists "Read published company logos" on storage.objects;
create policy "Read published company logos" on storage.objects for select to anon,authenticated
using(bucket_id='site-media' and exists(select 1 from public.site_content c where c.section in ('companies','testimonials','profile') and c.items @> jsonb_build_array(jsonb_build_object('logo',jsonb_build_object('path',name)))));

alter table public.projects add column if not exists kind text not null default 'project';
alter table public.projects drop constraint if exists projects_kind_check;
alter table public.projects add constraint projects_kind_check check(kind in ('project','photography'));
alter table public.projects drop constraint if exists projects_stack_slot_check;
alter table public.projects add constraint projects_stack_slot_check check(stack_slot between 1 and 6);
alter table public.projects drop constraint if exists photography_no_feature_slots;
alter table public.projects add constraint photography_no_feature_slots check(kind<>'photography' or (hero_slot is null and stack_slot is null));
update storage.buckets set file_size_limit=41943040,allowed_mime_types=array['image/jpeg','image/png','image/webp','video/mp4','video/webm'] where id='project-media';
-- Replace the old one-argument RPC to keep ordering isolated by collection.
drop function if exists public.reorder_portfolio(uuid[]);
create or replace function public.reorder_portfolio(project_ids uuid[], project_kind text default 'project') returns void language plpgsql security invoker set search_path='' as $collection_order$
begin
 if not public.is_portfolio_admin() then raise exception 'Admin access required'; end if;
 if project_kind is null or project_kind not in ('project','photography') then raise exception 'Invalid collection'; end if;
 lock table public.projects in share row exclusive mode;
 if project_ids is null or cardinality(project_ids) <> (select count(*) from public.projects where status='published' and kind=project_kind)
 or cardinality(project_ids) <> (select count(distinct id) from unnest(project_ids) id)
 or exists(select 1 from unnest(project_ids) as submitted(id) where not exists(select 1 from public.projects p where p.id=submitted.id and p.status='published' and p.kind=project_kind)) then
 raise exception 'Published items changed. Reload and try again.';
 end if;
 update public.projects p set sort_order=ordered.position::integer from unnest(project_ids) with ordinality as ordered(id,position) where p.id=ordered.id;
end; $collection_order$;
revoke all on function public.reorder_portfolio(uuid[],text) from public,anon;
grant execute on function public.reorder_portfolio(uuid[],text) to authenticated;
notify pgrst, 'reload schema';
commit;

