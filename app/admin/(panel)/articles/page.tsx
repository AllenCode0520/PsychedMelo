import Link from 'next/link';
import { formatDate } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import type { Article } from '@/lib/types';

type Row = Pick<Article, 'id' | 'title' | 'slug' | 'status' | 'published_at' | 'updated_at'>;

function statusLabel(row: Row): { text: string; live: boolean } {
  if (row.status !== 'published') return { text: '草稿', live: false };
  if (row.published_at && new Date(row.published_at) > new Date()) {
    return { text: `排程：${formatDate(row.published_at)}`, live: false };
  }
  return { text: '已發布', live: true };
}

export default async function AdminArticlesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('articles')
    .select('id, title, slug, status, published_at, updated_at')
    .order('updated_at', { ascending: false });
  const articles = (data ?? []) as Row[];

  return (
    <>
      <div className="admin-head">
        <div>
          <p className="hud-label">航行日誌 · Logbook</p>
          <h1>文章</h1>
        </div>
        <Link href="/admin/articles/new" className="btn btn--primary">
          寫文章
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="empty-note">還沒有文章。按「寫文章」開始第一篇航行日誌。</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">標題</th>
                <th scope="col">狀態</th>
                <th scope="col">更新</th>
                <th scope="col">
                  <span className="visually-hidden">動作</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => {
                const status = statusLabel(article);
                return (
                  <tr key={article.id}>
                    <td>
                      <strong>{article.title}</strong>
                      <div className="admin-table__sub">/articles/{article.slug}</div>
                    </td>
                    <td>
                      <span className="status">
                        <span className={`led${status.live ? ' led--teal is-on' : ''}`} aria-hidden="true" />
                        {status.text}
                      </span>
                    </td>
                    <td>{formatDate(article.updated_at)}</td>
                    <td className="admin-table__actions">
                      <Link href={`/admin/articles/${article.id}`} className="btn btn--small">
                        編輯
                      </Link>
                      {status.live && (
                        <Link href={`/articles/${article.slug}`} className="btn btn--small">
                          查看
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
