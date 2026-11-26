import type { Metadata } from 'next';
import { getSettings } from '@/lib/data';
import { truncate } from '@/lib/format';
import { cleanHtml, stripHtml } from '@/lib/sanitize';
import { BRAND_KEY_VISUAL, DEFAULT_OG_IMAGE, heroImageOf } from '@/lib/site';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const about = stripHtml(settings.about_html);
  const description = about ? truncate(about, 150) : settings.default_description;
  return {
    title: 'About',
    description,
    alternates: { canonical: '/about' },
    openGraph: {
      siteName: settings.site_name,
      locale: 'zh_TW',
      title: `About｜${settings.site_name}`,
      description,
      url: '/about',
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function AboutPage() {
  const settings = await getSettings();
  const html = settings.about_html ? cleanHtml(settings.about_html) : '';
  const heroAlt = settings.hero_image_url ? `${settings.site_name} 主視覺` : BRAND_KEY_VISUAL.alt;

  return (
    <div className="shell article">
      <header className="page-head">
        <p className="hud-label">About</p>
        <h1>關於 {settings.site_name}</h1>
        {settings.tagline && <p>{settings.tagline}</p>}
      </header>
      <figure className="article__cover">
        <img src={heroImageOf(settings)} alt={heroAlt} width={2000} height={1125} />
      </figure>
      {html ? (
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p className="empty-note">介紹還在整理中，晚點再回來看看。</p>
      )}
    </div>
  );
}
