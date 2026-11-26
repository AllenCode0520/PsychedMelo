import Link from 'next/link';
import { formatDate } from '@/lib/format';
import type { ArticleSummary } from '@/lib/types';

export function ArticleGrid({
  articles,
  headingLevel = 'h3',
}: {
  articles: ArticleSummary[];
  headingLevel?: 'h2' | 'h3';
}) {
  const Heading = headingLevel;

  if (articles.length === 0) {
    return <p className="empty-note">航行日誌還是空白的，第一篇記錄撰寫中。</p>;
  }

  return (
    <ul className="log-grid">
      {articles.map((article) => (
        <li key={article.id}>
          <article className="log-card panel">
            <div className="log-card__cover" aria-hidden="true">
              {article.cover_url ? (
                <img src={article.cover_url} alt="" loading="lazy" />
              ) : (
                <span className="hud-label">Log entry</span>
              )}
            </div>
            <div className="log-card__body">
              <time className="hud-label" dateTime={article.published_at ?? undefined}>
                {formatDate(article.published_at)}
              </time>
              <Heading className="log-card__title">
                <Link href={`/articles/${article.slug}`}>{article.title}</Link>
              </Heading>
              {article.excerpt && <p className="log-card__excerpt">{article.excerpt}</p>}
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
