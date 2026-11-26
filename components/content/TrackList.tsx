'use client';

import Link from 'next/link';
import { PlayButton } from '@/components/player/PlayButton';
import { usePlayer } from '@/components/player/PlayerProvider';
import { PsychedelicVisual } from '@/components/visuals/PsychedelicVisual';
import { formatDuration } from '@/lib/format';
import type { PlayerTrack } from '@/lib/types';

export function TrackList({ tracks }: { tracks: PlayerTrack[] }) {
  const { current } = usePlayer();

  if (tracks.length === 0) {
    return <p className="empty-note">貨艙還是空的，第一首音軌即將登艦。</p>;
  }

  return (
    <ol className="track-list">
      {tracks.map((track, i) => (
        <li key={track.id} className={`track-row panel${current?.id === track.id ? ' is-current' : ''}`}>
          <span className="track-row__no readout" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <PlayButton tracks={tracks} index={i} variant="icon" />
          <div className="track-row__cover" aria-hidden="true">
            {track.cover_url ? (
              <img src={track.cover_url} alt="" loading="lazy" />
            ) : (
              <PsychedelicVisual playing={false} />
            )}
          </div>
          <div className="track-row__meta">
            <Link href={`/music/${track.slug}`} className="track-row__title">
              {track.title}
            </Link>
            <span className="track-row__artist">{track.artist}</span>
          </div>
          <span className="track-row__time readout">{formatDuration(track.duration_seconds)}</span>
        </li>
      ))}
    </ol>
  );
}
