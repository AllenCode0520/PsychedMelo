import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getPublishedArticles, getSettings } from '@/lib/data';
import { formatDate, jsonLd, readingMinutes, truncate } from '@/lib/format';
import { cleanHtml, stripHtml } from '@/lib/sanitize';
import { DEFAULT_OG_IMAGE, siteUrl } from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [article, settings] = await Promise.all([getArticleBySlug(slug), getSettings()]);
  if (!article) return { title: '找不到這篇文章' };

  const title = article.meta_title || article.title;
  const description =
    article.meta_description || article.excerpt || truncate(stripHtml(article.content_html), 150);
  return {
    title,
    description,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      type: 'article',
      siteName: settings.site_name,
      locale: 'zh_TW',
      title,
      description,
      url: `/articles/${article.slug}`,
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at,
      images: article.cover_url ? [{ url: article.cover_url, alt: title }] : [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [article, settings] = await Promise.all([getArticleBySlug(slug), getSettings()]);
  if (!article) notFound();

  const html = cleanHtml(article.content_html);
  const plain = stripHtml(article.content_html);
  const url = `${siteUrl}/articles/${article.slug}`;

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.meta_description || article.excerpt || truncate(plain, 150),
    image: article.cover_url ? [article.cover_url] : undefined,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    mainEntityOfPage: url,
    url,
    inLanguage: 'zh-Hant',
    author: { '@type': 'Organization', name: settings.site_name, url: siteUrl },
    publisher: { '@type': 'Organization', name: settings.site_name, url: siteUrl },
  };

  return (
    <article className="shell article">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleLd) }} />
      <nav aria-label="麵包屑" className="crumbs">
        <Link href="/articles">Journal</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{article.title}</span>
      </nav>

      <header className="article__head">
        <p className="hud-label">Journal</p>
        <h1>{article.title}</h1>
        <div className="article__meta">
          <time dateTime={article.published_at ?? undefined}>{formatDate(article.published_at)}</time>
          <span>閱讀約 {readingMinutes(plain)} 分鐘</span>
        </div>
      </header>

      {article.cover_url && (
        <figure className="article__cover">
          <img src={article.cover_url} alt="" />
        </figure>
      )}

      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

      <footer className="article__foot">
        <Link href="/articles" className="btn">
          ← 所有文章
        </Link>
        <Link href="/music" className="btn btn--primary">
          邊讀邊聽音樂
        </Link>
      </footer>
    </article>
  );
}
