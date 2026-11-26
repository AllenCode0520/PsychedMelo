'use client';

import type { PlayerTrack } from '@/lib/types';
import { PauseIcon, PlayIcon } from '@/components/cockpit/Icons';
import { usePlayer } from './PlayerProvider';

type Props = {
  tracks: PlayerTrack[];
  index?: number;
  label?: string;
  variant?: 'primary' | 'secondary' | 'icon';
};

/** 播放一串音軌，從第 index 首開始；如果那首正在播，就變成暫停鍵。 */
export function PlayButton({ tracks, index = 0, label = '播放', variant = 'primary' }: Props) {
  const player = usePlayer();
  const track = tracks[index];
  const isCurrent = Boolean(track) && player.current?.id === track?.id;
  const isPlaying = isCurrent && player.playing;

  function onClick() {
    if (!track) return;
    if (isCurrent) player.toggle();
    else player.playQueue(tracks, index);
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        className="icon-btn icon-btn--ring"
        onClick={onClick}
        disabled={!track}
        aria-label={`${isPlaying ? '暫停' : '播放'} ${track?.title ?? ''}`.trim()}
      >
        {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`btn${variant === 'primary' ? ' btn--primary' : ''}`}
      onClick={onClick}
      disabled={!track}
    >
      {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
      <span>{isPlaying ? '暫停' : label}</span>
    </button>
  );
}
