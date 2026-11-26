'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { deleteObject, publicBaseUrl, storageConfigured } from '@/lib/storage';
import { SLUG_PATTERN, supabaseConfigured } from '@/lib/site';
import { createClient } from '@/lib/supabase/server';
import { cleanHtml } from '@/lib/sanitize';
import { isMediaKind, type SocialLink, type VisualType } from '@/lib/types';

export type FormState = { error?: string; message?: string };

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function optional(formData: FormData, key: string): string | null {
  return text(formData, key) || null;
}

function toInt(value: string): number | null {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

/** 內容有變動時，讓前台所有頁面重新產生。 */
function refreshSite() {
  revalidatePath('/', 'layout');
}

function duplicateSlug(code: string | undefined): boolean {
  return code === '23505';
}

// ───────── 登入 / 登出 ─────────

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!supabaseConfigured()) {
    return { error: '尚未設定 Supabase，請先依 README 填寫 .env.local。' };
  }
  const email = text(formData, 'email');
  const password = typeof formData.get('password') === 'string' ? String(formData.get('password')) : '';
  if (!email || !password) return { error: '請輸入 Email 和密碼。' };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: '登入失敗：Email 或密碼不正確。' };

  const { data: admin } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', data.user.id)
    .maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return { error: '這個帳號沒有管理權限。' };
  }

  redirect('/admin');
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

// ───────── 音軌 ─────────

export async function saveTrack(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const id = text(formData, 'id');
  const title = text(formData, 'title');
  const slug = text(formData, 'slug').toLowerCase();
  const audioUrl = text(formData, 'audio_url');
  const visualRaw = text(formData, 'visual_type');
  const visualType: VisualType =
    visualRaw === 'image' || visualRaw === 'video' ? visualRaw : 'psychedelic';
  const visualUrl = visualType === 'psychedelic' ? null : optional(formData, 'visual_url');

  if (!title) return { error: '請填寫曲名。' };
  if (!SLUG_PATTERN.test(slug)) return { error: '網址代稱只能用英文小寫、數字和連字號。' };
  if (!audioUrl) return { error: '請上傳音檔。' };
  if (visualType !== 'psychedelic' && !visualUrl) {
    return { error: '選了圖片或影片當視覺，請上傳檔案，或改回迷幻動畫。' };
  }

  const payload = {
    title,
    slug,
    artist: text(formData, 'artist') || 'PsychedMelo',
    description: text(formData, 'description'),
    audio_url: audioUrl,
    duration_seconds: toInt(text(formData, 'duration_seconds')),
    cover_url: optional(formData, 'cover_url'),
    visual_type: visualType,
    visual_url: visualUrl,
    sort_order: toInt(text(formData, 'sort_order')) ?? 0,
    published: formData.get('published') === 'on',
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from('tracks').update(payload).eq('id', id)
    : await supabase.from('tracks').insert(payload);
  if (error) {
    return {
      error: duplicateSlug(error.code)
        ? '這個網址代稱已經有其他音軌在用了。'
        : `儲存失敗：${error.message}`,
    };
  }

  refreshSite();
  redirect('/admin/tracks');
}

export async function deleteTrack(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = text(formData, 'id');
  if (!id) return;
  const supabase = await createClient();
  await supabase.from('tracks').delete().eq('id', id);
  refreshSite();
  redirect('/admin/tracks');
}

// ───────── 文章 ─────────

export async function saveArticle(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const id = text(formData, 'id');
  const title = text(formData, 'title');
  const slug = text(formData, 'slug').toLowerCase();
  const status = text(formData, 'status') === 'published' ? 'published' : 'draft';
  let publishedAt = optional(formData, 'published_at');

  if (!title) return { error: '請填寫標題。' };
  if (!SLUG_PATTERN.test(slug)) return { error: '網址代稱只能用英文小寫、數字和連字號。' };
  if (publishedAt && Number.isNaN(Date.parse(publishedAt))) {
    return { error: '發布時間格式不正確。' };
  }
  if (status === 'published' && !publishedAt) publishedAt = new Date().toISOString();

  const payload = {
    title,
    slug,
    excerpt: text(formData, 'excerpt'),
    content_html: cleanHtml(text(formData, 'content_html')),
    cover_url: optional(formData, 'cover_url'),
    meta_title: optional(formData, 'meta_title'),
    meta_description: optional(formData, 'meta_description'),
    status,
    published_at: publishedAt,
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from('articles').update(payload).eq('id', id)
    : await supabase.from('articles').insert(payload);
  if (error) {
    return {
      error: duplicateSlug(error.code)
        ? '這個網址代稱已經有其他文章在用了。'
        : `儲存失敗：${error.message}`,
    };
  }

  refreshSite();
  redirect('/admin/articles');
}

export async function deleteArticle(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = text(formData, 'id');
  if (!id) return;
  const supabase = await createClient();
  await supabase.from('articles').delete().eq('id', id);
  refreshSite();
  redirect('/admin/articles');
}

// ───────── 媒體庫 ─────────

export async function recordMedia(input: {
  url: string;
  key: string;
  kind: string;
  contentType: string;
  size: number;
}): Promise<void> {
  await requireAdmin();
  if (!isMediaKind(input.kind)) throw new Error('不支援的檔案類型。');
  const base = publicBaseUrl();
  if (!storageConfigured() || !input.url.startsWith(`${base}/`)) throw new Error('檔案網址不正確。');

  const supabase = await createClient();
  const { error } = await supabase.from('media').insert({
    url: input.url,
    key: input.key,
    kind: input.kind,
    content_type: input.contentType,
    size_bytes: input.size,
  });
  if (error) throw new Error(`記錄檔案失敗：${error.message}`);
  revalidatePath('/admin/media');
}

export async function deleteMedia(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = text(formData, 'id');
  if (!id) return;
  const supabase = await createClient();
  const { data } = await supabase.from('media').select('key').eq('id', id).maybeSingle();
  if (data?.key && storageConfigured()) {
    try {
      await deleteObject(data.key as string);
    } catch (error) {
      console.error('[media] 刪除 Storage 檔案失敗', error);
    }
  }
  await supabase.from('media').delete().eq('id', id);
  revalidatePath('/admin/media');
}

// ───────── 網站設定 ─────────

function parseSocialLinks(raw: string): SocialLink[] | string {
  const links: SocialLink[] = [];
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [label, url] = trimmed.split('|').map((part) => part.trim());
    if (!label || !url || !/^https?:\/\//.test(url)) {
      return `社群連結格式不對：「${trimmed}」。請用「名稱 | https://網址」。`;
    }
    links.push({ label, url });
  }
  return links;
}

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const siteName = text(formData, 'site_name');
  if (!siteName) return { error: '請填寫網站名稱。' };
  const socialLinks = parseSocialLinks(text(formData, 'social_links'));
  if (typeof socialLinks === 'string') return { error: socialLinks };

  const supabase = await createClient();
  const { error } = await supabase.from('settings').upsert({
    id: 1,
    site_name: siteName,
    tagline: text(formData, 'tagline'),
    default_description: text(formData, 'default_description'),
    about_html: text(formData, 'about_html'),
    social_links: socialLinks,
    hero_image_url: text(formData, 'hero_image_url'),
  });
  if (error) return { error: `儲存失敗：${error.message}` };

  refreshSite();
  return { message: '設定已儲存。' };
}
