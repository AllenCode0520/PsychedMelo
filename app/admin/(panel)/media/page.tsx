import { deleteMedia } from '@/app/admin/actions';
import { CopyButton } from '@/components/admin/CopyButton';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { formatDate } from '@/lib/format';
import { storageConfigured } from '@/lib/storage';
import { createClient } from '@/lib/supabase/server';
import type { MediaItem } from '@/lib/types';

const KIND_LABELS = { audio: '音檔', image: '圖片', video: '影片' } as const;

function fileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileName(key: string): string {
  const last = key.split('/').pop() ?? key;
  return last.replace(/^[0-9a-f-]{36}-/, '');
}

export default async function AdminMediaPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300);
  const items = (data ?? []) as MediaItem[];

  return (
    <>
      <div className="admin-head">
        <div>
          <p className="hud-label">儲藏室 · Media</p>
          <h1>媒體庫</h1>
        </div>
      </div>

      {storageConfigured() ? (
        <MediaUploader />
      ) : (
        <p className="form-error" role="alert">
          尚未設定 Supabase，暫時無法上傳。請依 README 填寫環境變數。
        </p>
      )}

      {items.length === 0 ? (
        <p className="empty-note">媒體庫是空的。上傳的音檔、圖片和影片都會出現在這裡。</p>
      ) : (
        <ul className="media-grid">
          {items.map((item) => (
            <li key={item.id} className="media-card panel">
              <div className="media-card__preview">
                {item.kind === 'image' && <img src={item.url} alt="" loading="lazy" />}
                {item.kind === 'video' && <video src={item.url} muted playsInline preload="metadata" />}
                {item.kind === 'audio' && <audio src={item.url} controls preload="none" />}
              </div>
              <div className="media-card__body">
                <span className="hud-label">
                  {KIND_LABELS[item.kind]} · {fileSize(item.size_bytes)}
                </span>
                <span className="media-card__name" title={item.key}>
                  {fileName(item.key)}
                </span>
                <span className="admin-table__sub">{formatDate(item.created_at)}</span>
                <div className="media-card__actions">
                  <CopyButton text={item.url} />
                  <DeleteButton
                    action={deleteMedia}
                    id={item.id}
                    confirmText="確定要刪除這個檔案嗎？有用到它的音軌或文章會顯示不出來，這個動作無法復原。"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
