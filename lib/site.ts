import type { SiteSettings } from './types';

function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return 'http://localhost:3000';
}

/** 網站正式網址，結尾沒有斜線。用在 sitemap、canonical、結構化資料。 */
export const siteUrl = resolveSiteUrl().replace(/\/+$/, '');

/** 日期顯示用的時區。 */
export const SITE_TIMEZONE = 'Asia/Taipei';

/** 網址代稱：英文小寫、數字、連字號。 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'PsychedMelo',
  tagline: 'Lo-fi Music Hi-fi Life',
  default_description: 'PsychedMelo：迷幻 lofi 音樂與隨筆。',
  about_html: '',
  social_links: [],
  hero_image_url: '',
};

/** 內建的品牌主視覺（public/brand/）。 */
export const BRAND_KEY_VISUAL = {
  url: '/brand/psychedmelo-key-visual.jpg',
  alt: 'Psychedmelo 主視覺：電腦頭角色和條紋貓站在浮空島上，周圍漂著音符、卡帶與小機器人',
};

/**
 * 沒有自己封面的頁面，分享到社群時用這張（1200×630）。
 * 貓鹿放在正中間，LINE / iMessage 裁成正方形時也不會被切到。
 * 換圖時請改檔名（社群平台會依網址快取舊圖）。
 */
export const DEFAULT_OG_IMAGE = {
  url: '/brand/psychedmelo-og-mascot.jpg',
  width: 1200,
  height: 630,
  alt: 'PsychedMelo 吉祥物：戴著 84 號棒球帽、長著鹿角的粉紅條紋貓鹿',
};

export function heroImageOf(settings: SiteSettings): string {
  return settings.hero_image_url || BRAND_KEY_VISUAL.url;
}

export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
