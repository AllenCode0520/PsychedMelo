import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PlayButton } from '@/components/player/PlayButton';
import { Viewport } from '@/components/visuals/Viewport';
import { getPublishedTracks, getSettings, getTrackBySlug } from '@/lib/data';
import { formatDate, formatDuration, isoDuration, jsonLd, truncate } from '@/lib/format';
import { DEFAULT_OG_IMAGE, siteUrl } from '@/lib/site';
import { toPlayerTrack } from '@/lib/types';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  const tracks = await getPublishedTracks();
  return tracks.map((track) => ({ slug: track.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [track, settings] = await Promise.all([getTrackBySlug(slug), getSettings()]);
  if (!track) return { title: '找不到這首歌' };

  const description = track.description
    ? truncate(track.description, 140)
    : `${track.title} — ${track.artist}。在線上直接收聽。`;
  return {
    title: `${track.title} - ${track.artist}`,
    description,
    alternates: { canonical: `/music/${track.slug}` },
    openGraph: {
      type: 'music.song',
      siteName: settings.site_name,
      locale: 'zh_TW',
      title: track.title,
      description,
      url: `/music/${track.slug}`,
      images: track.cover_url ? [{ url: track.cover_url, alt: track.title }] : [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function TrackPage({ params }: Props) {
  const { slug } = await params;
  const [track, allTracks, settings] = await Promise.all([
    getTrackBySlug(slug),
    getPublishedTracks(),
    getSettings(),
  ]);
  if (!track) notFound();

  // 從這首開始，接著播放後面的音軌
  const queue = allTracks.map(toPlayerTrack);
  let startIndex = queue.findIndex((item) => item.id === track.id);
  if (startIndex === -1) {
    queue.unshift(toPlayerTrack(track));
    startIndex = 0;
  }

  const trackLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: track.title,
    url: `${siteUrl}/music/${track.slug}`,
    byArtist: { '@type': 'MusicGroup', name: track.artist },
    duration: isoDuration(track.duration_seconds),
    image: track.cover_url ?? undefined,
    description: track.description || undefined,
    datePublished: track.created_at,
    inLanguage: 'zh-Hant',
    publisher: { '@type': 'Organization', name: settings.site_name, url: siteUrl },
  };

  return (
    <article className="shell track-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(trackLd) }} />
      <nav aria-label="麵包屑" className="crumbs">
        <Link href="/music">Music</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{track.title}</span>
      </nav>

      <div className="track-page__grid">
        <Viewport source={track} shape="round" label={`${track.title} 的視覺`} />
        <div className="track-page__info panel panel--rivets">
          <p className="hud-label">Track</p>
          <h1>{track.title}</h1>
          <p className="track-page__artist">{track.artist}</p>
          <dl className="readouts readouts--inline">
            <div>
              <dt className="hud-label">長度</dt>
              <dd className="readout">{formatDuration(track.duration_seconds)}</dd>
            </div>
            <div>
              <dt className="hud-label">發佈日期</dt>
              <dd>{formatDate(track.created_at)}</dd>
            </div>
          </dl>
          <div>
            <PlayButton tracks={queue} index={startIndex} label="播放這首" />
          </div>
          {track.description && <div className="track-page__desc">{track.description}</div>}
        </div>
      </div>
    </article>
  );
}
