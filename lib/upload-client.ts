import { recordMedia } from '@/app/admin/actions';
import type { MediaKind } from './types';

type UploadTicket = { uploadUrl: string; publicUrl: string; key: string };

/**
 * 後台上傳檔案：先跟伺服器要一個一次性上傳網址，再從瀏覽器直接傳到 Supabase Storage，
 * 最後把檔案記到媒體庫。回傳公開網址。
 */
export async function uploadFile(
  file: File,
  kind: MediaKind,
  onProgress?: (percent: number) => void,
): Promise<{ url: string; key: string }> {
  const contentType = file.type || 'application/octet-stream';
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, contentType, kind, size: file.size }),
  });
  const data = (await response.json().catch(() => ({}))) as Partial<UploadTicket> & {
    error?: string;
  };
  if (!response.ok || !data.uploadUrl || !data.publicUrl || !data.key) {
    throw new Error(data.error ?? '無法取得上傳網址。');
  }
  const ticket = data as UploadTicket;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', ticket.uploadUrl);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`檔案傳到儲存空間失敗（${xhr.status}）。`));
    };
    xhr.onerror = () =>
      reject(new Error('上傳失敗：網路中斷，或 Supabase Storage 拒絕了這個檔案。'));
    xhr.send(file);
  });

  await recordMedia({
    url: ticket.publicUrl,
    key: ticket.key,
    kind,
    contentType,
    size: file.size,
  });

  return { url: ticket.publicUrl, key: ticket.key };
}

export function mediaKindOf(file: File): MediaKind | null {
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return null;
}
