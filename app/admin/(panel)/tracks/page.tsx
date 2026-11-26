import Link from 'next/link';
import { formatDate, formatDuration } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import type { Track } from '@/lib/types';

type Row = Pick<Track, 'id' | 'title' | 'slug' | 'artist' | 'published' | 'duration_seconds' | 'updated_at'>;

export default async function AdminTracksPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('tracks')
    .select('id, title, slug, artist, published, duration_seconds, updated_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  const tracks = (data ?? []) as Row[];

  return (
    <>
      <div className="admin-head">
        <div>
          <p className="hud-label">貨艙 · Tracks</p>
          <h1>音軌</h1>
        </div>
        <Link href="/admin/tracks/new" className="btn btn--primary">
          上傳音軌
        </Link>
      </div>

      {tracks.length === 0 ? (
        <p className="empty-note">還沒有音軌。按「上傳音軌」放進第一首。</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">曲名</th>
                <th scope="col">狀態</th>
                <th scope="col">長度</th>
                <th scope="col">更新</th>
                <th scope="col">
                  <span className="visually-hidden">動作</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((track) => (
                <tr key={track.id}>
                  <td>
                    <strong>{track.title}</strong>
                    <div className="admin-table__sub">
                      {track.artist} · /music/{track.slug}
                    </div>
                  </td>
                  <td>
                    <span className="status">
                      <span className={`led${track.published ? ' led--teal is-on' : ''}`} aria-hidden="true" />
                      {track.published ? '已發布' : '草稿'}
                    </span>
                  </td>
                  <td className="readout">{formatDuration(track.duration_seconds)}</td>
                  <td>{formatDate(track.updated_at)}</td>
                  <td className="admin-table__actions">
                    <Link href={`/admin/tracks/${track.id}`} className="btn btn--small">
                      編輯
                    </Link>
                    {track.published && (
                      <Link href={`/music/${track.slug}`} className="btn btn--small">
                        查看
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
