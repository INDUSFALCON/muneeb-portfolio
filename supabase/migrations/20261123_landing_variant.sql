create table if not exists public.site_settings (
  id boolean primary key default true check (id = true),
  landing_variant text not null default 'legacy' check (landing_variant in ('legacy','v2')),
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings" on public.site_settings for select using (true);
drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select on public.site_settings to anon, authenticated;
grant insert,update,delete on public.site_settings to authenticated;
insert into public.site_settings (id, landing_variant) values (true,'legacy') on conflict (id) do nothing;
