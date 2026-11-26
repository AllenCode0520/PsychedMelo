import { supabaseConfigured } from './site';
import { createClient } from './supabase/server';

/** 存放音檔、圖片、影片的 Supabase Storage bucket（要設成 public）。 */
export const MEDIA_BUCKET = process.env.SUPABASE_MEDIA_BUCKET || 'media';

export function storageConfigured(): boolean {
  return supabaseConfigured();
}

/** 公開網址的開頭：https://<專案>.supabase.co/storage/v1/object/public/<bucket>/ */
export function publicBaseUrl(): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}`;
}

export function publicUrlFor(key: string): string {
  return `${publicBaseUrl()}/${key}`;
}

/**
 * 產生一次性的上傳網址：瀏覽器直接把檔案傳到 Supabase Storage，不經過我們的伺服器。
 * 用管理員的登入狀態產生，所以要有 storage 的寫入權限（見 supabase/schema.sql）。
 */
export async function createUploadUrl(key: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUploadUrl(key);
  if (error || !data) throw new Error(error?.message ?? '無法建立上傳網址。');
  return data.signedUrl;
}

export async function deleteObject(key: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([key]);
  if (error) throw new Error(error.message);
}
