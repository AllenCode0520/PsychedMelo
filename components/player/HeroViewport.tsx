'use client';

import { Viewport } from '@/components/visuals/Viewport';
import { usePlayer } from './PlayerProvider';

/**
 * 首頁大舷窗：正在播放時顯示那首歌的視覺；
 * 沒在播放時，從舷窗看出去是 Psychedmelo 的世界（主視覺）。
 */
export function HeroViewport({ idleImage, idleLabel }: { idleImage: string; idleLabel: string }) {
  const { current, playing } = usePlayer();

  if (current) {
    return (
      <Viewport
        source={current}
        playing={playing}
        shape="screen"
        label={`${current.title} 的視覺`}
      />
    );
  }

  return (
    <Viewport
      source={{ visual_type: 'image', visual_url: idleImage }}
      shape="screen"
      label={idleLabel}
    />
  );
}
