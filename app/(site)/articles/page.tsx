import type { Metadata } from 'next';
import { ArticleGrid } from '@/components/content/ArticleGrid';
import { getPublishedArticles, getSettings } from '@/lib/data';
import { DEFAULT_OG_IMAGE } from '@/lib/site';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const description = `${settings.site_name} 的航行日誌：關於音樂、創作與這艘船的紀錄。`;
  return {
    title: '航行日誌',
    description,
    alternates: { canonical: '/articles' },
    openGraph: {
      siteName: settings.site_name,
      locale: 'zh_TW',
      title: `航行日誌｜${settings.site_name}`,
      description,
      url: '/articles',
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="hud-label">航行日誌 · Logbook</p>
        <h1>航行日誌</h1>
        <p>關於音樂、創作，以及這趟旅程的紀錄。</p>
      </header>
      <ArticleGrid articles={articles} headingLevel="h2" />
    </div>
  );
}
