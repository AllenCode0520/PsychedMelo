import { getPublishedArticles, getSettings } from '@/lib/data';
import { siteUrl } from '@/lib/site';

export const dynamic = 'force-static';
export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** 航行日誌的 RSS，給訂閱器與搜尋引擎用。 */
export async function GET() {
  const [articles, settings] = await Promise.all([getPublishedArticles(50), getSettings()]);

  const items = articles
    .map((article) => {
      const link = `${siteUrl}/articles/${article.slug}`;
      const pubDate = article.published_at ? new Date(article.published_at).toUTCString() : '';
      return [
        '<item>',
        `<title>${escapeXml(article.title)}</title>`,
        `<link>${link}</link>`,
        `<guid isPermaLink="true">${link}</guid>`,
        pubDate ? `<pubDate>${pubDate}</pubDate>` : '',
        `<description>${escapeXml(article.excerpt ?? '')}</description>`,
        '</item>',
      ].join('');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${escapeXml(`${settings.site_name} 航行日誌`)}</title>
<link>${siteUrl}</link>
<atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
<description>${escapeXml(settings.default_description)}</description>
<language>zh-TW</language>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
