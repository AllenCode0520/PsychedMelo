export type VisualType = 'psychedelic' | 'image' | 'video';
export type MediaKind = 'audio' | 'image' | 'video';
export type ArticleStatus = 'draft' | 'published';

export interface Track {
  id: string;
  slug: string;
  title: string;
  artist: string;
  description: string | null;
  audio_url: string;
  duration_seconds: number | null;
  cover_url: string | null;
  visual_type: VisualType;
  visual_url: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_html: string;
  cover_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  status: ArticleStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ArticleSummary = Pick<
  Article,
  'id' | 'slug' | 'title' | 'excerpt' | 'cover_url' | 'published_at' | 'updated_at'
>;

export interface MediaItem {
  id: string;
  url: string;
  key: string;
  kind: MediaKind;
  content_type: string | null;
  size_bytes: number | null;
  alt: string | null;
  created_at: string;
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface SiteSettings {
  site_name: string;
  tagline: string;
  default_description: string;
  about_html: string;
  social_links: SocialLink[];
  /** 首頁舷窗待機時的主視覺；空字串時用內建的 Psychedmelo 主視覺。 */
  hero_image_url: string;
}

/** 播放器只需要的欄位，從伺服器傳到瀏覽器時越少越好。 */
export type PlayerTrack = Pick<
  Track,
  | 'id'
  | 'slug'
  | 'title'
  | 'artist'
  | 'audio_url'
  | 'cover_url'
  | 'visual_type'
  | 'visual_url'
  | 'duration_seconds'
>;

export function toPlayerTrack(track: Track): PlayerTrack {
  return {
    id: track.id,
    slug: track.slug,
    title: track.title,
    artist: track.artist,
    audio_url: track.audio_url,
    cover_url: track.cover_url,
    visual_type: track.visual_type,
    visual_url: track.visual_url,
    duration_seconds: track.duration_seconds,
  };
}

export function isMediaKind(value: unknown): value is MediaKind {
  return value === 'audio' || value === 'image' || value === 'video';
}
