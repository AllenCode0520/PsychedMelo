import Link from 'next/link';
import { storageConfigured } from '@/lib/storage';
import { siteUrl } from '@/lib/site';
import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const [tracks, liveTracks, articles, liveArticles, media] = await Promise.all([
    supabase.from('tracks').select('id', { count: 'exact', head: true }),
    supabase.from('tracks').select('id', { count: 'exact', head: true }).eq('published', true),
    supabase.from('articles').select('id', { count: 'exact', head: true }),
    supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase.from('media').select('id', { count: 'exact', head: true }),
  ]);

  const stats = [
    { label: '音軌', value: tracks.count ?? 0, sub: `${liveTracks.count ?? 0} 首已發布`, href: '/admin/tracks' },
    { label: '文章', value: articles.count ?? 0, sub: `${liveArticles.count ?? 0} 篇已發布`, href: '/admin/articles' },
    { label: '媒體檔案', value: media.count ?? 0, sub: '音檔、圖片、影片', href: '/admin/media' },
  ];

  const checks = [
    { ok: true, label: 'Supabase 資料庫已連線' },
    { ok: storageConfigured(), label: 'Supabase Storage 檔案儲存（上傳功能需要）' },
    { ok: !siteUrl.includes('localhost'), label: `網站網址：${siteUrl}` },
  ];

  return (
    <>
      <div className="admin-head">
        <div>
          <p className="hud-label">總覽 · Status</p>
          <h1>艦橋總覽</h1>
        </div>
        <div className="admin-head__actions">
          <Link href="/admin/tracks/new" className="btn btn--primary">
            上傳音軌
          </Link>
          <Link href="/admin/articles/new" className="btn">
            寫文章
          </Link>
        </div>
      </div>

      <ul className="stat-grid">
        {stats.map((stat) => (
          <li key={stat.label} className="panel stat">
            <span className="hud-label">{stat.label}</span>
            <span className="readout readout--lg">{String(stat.value).padStart(2, '0')}</span>
            <span className="stat__sub">{stat.sub}</span>
            <Link href={stat.href} className="stat__link">
              管理{stat.label}
            </Link>
          </li>
        ))}
      </ul>

      <section className="panel admin-section" aria-labelledby="checks-title">
        <h2 id="checks-title">系統檢查</h2>
        <ul className="checklist">
          {checks.map((check) => (
            <li key={check.label}>
              <span className={`led${check.ok ? ' led--teal is-on' : ''}`} aria-hidden="true" />
              <span>{check.label}</span>
              <span className="checklist__state">{check.ok ? '正常' : '待設定'}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
