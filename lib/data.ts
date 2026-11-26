import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_SETTINGS, supabaseConfigured } from './site';
import type { Article, ArticleSummary, SiteSettings, SocialLink, Track } from './types';

/** 不帶登入狀態的公開連線：前台頁面用，可以被快取。資料權限由資料庫的 RLS 把關。 */
function publicClient() {
  if (!supabaseConfigured()) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

const ARTICLE_SUMMARY_COLUMNS = 'id, slug, title, excerpt, cover_url, published_at, updated_at';

export async function getPublishedTracks(limit?: number): Promise<Track[]> {
  const supabase = publicClient();
  if (!supabase) return [];
  let query = supabase
    .from('tracks')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) {
    console.error('[data] 讀取音軌失敗', error.message);
    return [];
  }
  return (data ?? []) as Track[];
}

export const getTrackBySlug = cache(async (slug: string): Promise<Track | null> => {
  const supabase = publicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  if (error) console.error('[data] 讀取音軌失敗', error.message);
  return (data as Track | null) ?? null;
});

export async function getPublishedArticles(limit?: number): Promise<ArticleSummary[]> {
  const supabase = publicClient();
  if (!supabase) return [];
  let query = supabase
    .from('articles')
    .select(ARTICLE_SUMMARY_COLUMNS)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) {
    console.error('[data] 讀取文章失敗', error.message);
    return [];
  }
  return (data ?? []) as ArticleSummary[];
}

export const getArticleBySlug = cache(async (slug: string): Promise<Article | null> => {
  const supabase = publicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle();
  if (error) console.error('[data] 讀取文章失敗', error.message);
  return (data as Article | null) ?? null;
});

function parseSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is SocialLink =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as SocialLink).label === 'string' &&
      typeof (item as SocialLink).url === 'string',
  );
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = publicClient();
  if (!supabase) return DEFAULT_SETTINGS;
  const { data, error } = await supabase
    .from('settings')
    .select('site_name, tagline, default_description, about_html, social_links, hero_image_url')
    .eq('id', 1)
    .maybeSingle();
  if (error || !data) {
    if (error) console.error('[data] 讀取網站設定失敗', error.message);
    return DEFAULT_SETTINGS;
  }
  return {
    site_name: data.site_name || DEFAULT_SETTINGS.site_name,
    tagline: data.tagline ?? '',
    default_description: data.default_description || DEFAULT_SETTINGS.default_description,
    about_html: data.about_html ?? '',
    social_links: parseSocialLinks(data.social_links),
    hero_image_url: data.hero_image_url ?? '',
  };
});
