-- PsychedMelo 資料表結構
-- 用法：在 Supabase 後台的 SQL Editor 貼上整份，按 Run。重複執行也沒關係。

create extension if not exists pgcrypto;

-- ───────── 共用：自動更新 updated_at ─────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ───────── 管理員名單 ─────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ───────── 音軌 ─────────
create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  artist text not null default 'PsychedMelo',
  description text not null default '',
  audio_url text not null,
  duration_seconds integer,
  cover_url text,
  visual_type text not null default 'psychedelic'
    check (visual_type in ('psychedelic', 'image', 'video')),
  visual_url text,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────── 文章（航行日誌） ─────────
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content_html text not null default '',
  cover_url text,
  meta_title text,
  meta_description text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────── 媒體庫（檔案本身在 Supabase Storage 的 media bucket） ─────────
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  key text not null unique,
  kind text not null check (kind in ('audio', 'image', 'video')),
  content_type text,
  size_bytes bigint,
  alt text not null default '',
  created_at timestamptz not null default now()
);

-- ───────── 網站設定（只有一列） ─────────
create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),
  site_name text not null default 'PsychedMelo',
  tagline text not null default '',
  default_description text not null default '',
  about_html text not null default '',
  social_links jsonb not null default '[]'::jsonb,
  hero_image_url text not null default '',
  updated_at timestamptz not null default now()
);

-- 舊版資料庫補欄位用（新建立的會略過）
alter table public.settings add column if not exists hero_image_url text not null default '';

insert into public.settings (id) values (1) on conflict (id) do nothing;

-- ───────── 觸發器與索引 ─────────
drop trigger if exists tracks_set_updated_at on public.tracks;
create trigger tracks_set_updated_at before update on public.tracks
  for each row execute function public.set_updated_at();

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at before update on public.articles
  for each row execute function public.set_updated_at();

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

create index if not exists tracks_published_idx on public.tracks (published, sort_order);
create index if not exists articles_published_idx on public.articles (status, published_at desc);

-- ───────── 權限（RLS）：訪客只能讀已發布的內容，管理員可以全部讀寫 ─────────
alter table public.admins enable row level security;
alter table public.tracks enable row level security;
alter table public.articles enable row level security;
alter table public.media enable row level security;
alter table public.settings enable row level security;

drop policy if exists "admins read own row" on public.admins;
create policy "admins read own row" on public.admins
  for select using (user_id = auth.uid());

drop policy if exists "tracks public read" on public.tracks;
create policy "tracks public read" on public.tracks
  for select using (published or public.is_admin());

drop policy if exists "tracks admin write" on public.tracks;
create policy "tracks admin write" on public.tracks
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "articles public read" on public.articles;
create policy "articles public read" on public.articles
  for select using ((status = 'published' and published_at <= now()) or public.is_admin());

drop policy if exists "articles admin write" on public.articles;
create policy "articles admin write" on public.articles
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "media admin only" on public.media;
create policy "media admin only" on public.media
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "settings public read" on public.settings;
create policy "settings public read" on public.settings
  for select using (true);

drop policy if exists "settings admin write" on public.settings;
create policy "settings admin write" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

grant select on public.tracks, public.articles, public.settings to anon, authenticated;
grant select on public.admins, public.media to authenticated;
grant insert, update, delete on public.tracks, public.articles, public.media, public.settings to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ───────── 檔案儲存（Supabase Storage）：公開讀取，只有管理員能上傳、修改、刪除 ─────────
insert into storage.buckets (id, name, public)
  values ('media', 'media', true)
  on conflict (id) do update set public = true;

drop policy if exists "media bucket public read" on storage.objects;
create policy "media bucket public read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media bucket admin insert" on storage.objects;
create policy "media bucket admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media bucket admin update" on storage.objects;
create policy "media bucket admin update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media bucket admin delete" on storage.objects;
create policy "media bucket admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- ───────── 把自己設成管理員 ─────────
-- 先到 Authentication → Users → Add user 建立帳號，再把下面的 email 換成你的，單獨執行：
-- insert into public.admins (user_id)
--   select id from auth.users where email = 'you@example.com'
--   on conflict do nothing;
