import type { Metadata } from 'next';
import Link from 'next/link';
import { ArticleGrid } from '@/components/content/ArticleGrid';
import { TrackList } from '@/components/content/TrackList';
import { CabinClock } from '@/components/cockpit/CabinClock';
import { HeroViewport } from '@/components/player/HeroViewport';
import { PlayButton } from '@/components/player/PlayButton';
import { getPublishedArticles, getPublishedTracks, getSettings } from '@/lib/data';
import { jsonLd, pad2 } from '@/lib/format';
import { BRAND_KEY_VISUAL, DEFAULT_OG_IMAGE, heroImageOf, siteUrl } from '@/lib/site';
import { toPlayerTrack } from '@/lib/types';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      siteName: settings.site_name,
      locale: 'zh_TW',
      url: '/',
      title: settings.tagline ? `${settings.site_name}｜${settings.tagline}` : settings.site_name,
      description: settings.default_description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function HomePage() {
  const [tracks, articles, settings] = await Promise.all([
    getPublishedTracks(),
    getPublishedArticles(),
    getSettings(),
  ]);
  const queue = tracks.map(toPlayerTrack);

  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings.site_name,
    url: siteUrl,
    description: settings.default_description,
    inLanguage: 'zh-Hant',
  };

  return (
    <div className="shell home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteLd) }} />

      <section className="crt-hero" aria-labelledby="console-title">
        <div className="crt-hero__screen">
          <HeroViewport
            idleImage={heroImageOf(settings)}
            idleLabel={settings.hero_image_url ? `${settings.site_name} 主視覺` : BRAND_KEY_VISUAL.alt}
          />
        </div>
        <div className="crt-hero__hud">
          <div className="crt-hero__top">
            <p className="glow-amber">主視窗 · 視覺頻道 01</p>
            <p className="glow-green">
              艙內時間 <CabinClock />
            </p>
          </div>
          <div className="crt-hero__bottom">
            <div className="crt-hero__title">
              <p className="glow-amber">&gt; 訊號穩定 · 音軌 {pad2(tracks.length)} · 日誌 {pad2(articles.length)}</p>
              <h1 id="console-title" className="glow-green">
                {settings.site_name}
                <span className="blink" aria-hidden="true">
                  ▮
                </span>
              </h1>
              {settings.tagline && <p className="crt-hero__tagline">{settings.tagline}</p>}
            </div>
            <div className="crt-hero__actions">
              {queue.length > 0 && <PlayButton tracks={queue} label="開始航行" />}
              <Link href="/music" className="btn">
                瀏覽音軌
              </Link>
              <Link href="/articles" className="btn">
                航行日誌
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="tracks-title">
        <div className="section__head">
          <h2 id="tracks-title">精選音軌</h2>
          <Link href="/music" className="section__more">
            全部音軌 →
          </Link>
        </div>
        <TrackList tracks={queue.slice(0, 6)} />
      </section>

      <section className="section" aria-labelledby="logs-title">
        <div className="section__head">
          <h2 id="logs-title">最新航行日誌</h2>
          <Link href="/articles" className="section__more">
            全部日誌 →
          </Link>
        </div>
        <ArticleGrid articles={articles.slice(0, 3)} />
      </section>
    </div>
  );
}
