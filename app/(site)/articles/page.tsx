import type { Metadata } from 'next';
import { ArticleGrid } from '@/components/content/ArticleGrid';
import { getPublishedArticles, getSettings } from '@/lib/data';
import { DEFAULT_OG_IMAGE } from '@/lib/site';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const description = `${settings.site_name} 的文章：關於音樂、創作與日常的紀錄。`;
  return {
    title: 'Journal',
    description,
    alternates: { canonical: '/articles' },
    openGraph: {
      siteName: settings.site_name,
      locale: 'zh_TW',
      title: `Journal｜${settings.site_name}`,
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
        <p className="hud-label">Notes &amp; stories</p>
        <h1>Journal</h1>
        <p>關於音樂、創作，以及一些日常的紀錄。</p>
      </header>
      <ArticleGrid articles={articles} headingLevel="h2" />
    </div>
  );
}
