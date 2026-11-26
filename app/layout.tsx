import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { DotGothic16, IBM_Plex_Mono, VT323 } from 'next/font/google';
import { getSettings } from '@/lib/data';
import { DEFAULT_OG_IMAGE, siteUrl } from '@/lib/site';
import './globals.css';

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex',
  display: 'swap',
});

const vt323 = VT323({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-vt',
  display: 'swap',
});

// 像素中文字：繁中字形靠 Google Fonts 分段載入，所以不預先載入。
const dotGothic = DotGothic16({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-dot',
  display: 'swap',
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.tagline ? `${settings.site_name}｜${settings.tagline}` : settings.site_name,
      template: `%s｜${settings.site_name}`,
    },
    description: settings.default_description,
    applicationName: settings.site_name,
    alternates: {
      types: { 'application/rss+xml': '/feed.xml' },
    },
    openGraph: {
      type: 'website',
      siteName: settings.site_name,
      locale: 'zh_TW',
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export const viewport: Viewport = {
  themeColor: '#06050c',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant" className={`${plexMono.variable} ${vt323.variable} ${dotGothic.variable}`}>
      <body>{children}</body>
    </html>
  );
}
