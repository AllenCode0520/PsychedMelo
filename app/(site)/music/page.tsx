import type { Metadata } from 'next';
import { TrackList } from '@/components/content/TrackList';
import { getPublishedTracks, getSettings } from '@/lib/data';
import { DEFAULT_OG_IMAGE } from '@/lib/site';
import { toPlayerTrack } from '@/lib/types';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const description = `${settings.site_name} 的全部音軌，在線上直接收聽。`;
  return {
    title: '音軌',
    description,
    alternates: { canonical: '/music' },
    openGraph: {
      siteName: settings.site_name,
      locale: 'zh_TW',
      title: `音軌｜${settings.site_name}`,
      description,
      url: '/music',
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function MusicPage() {
  const tracks = await getPublishedTracks();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="hud-label">貨艙 · Cargo hold</p>
        <h1>音軌</h1>
        <p>點播放鍵就能聽，換頁時音樂會繼續。</p>
      </header>
      <TrackList tracks={tracks.map(toPlayerTrack)} />
    </div>
  );
}
