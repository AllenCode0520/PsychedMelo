'use client';

import { useEffect, useRef } from 'react';

export function ViewportVideo({ src, playing }: { src: string; playing: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (playing) video.play().catch(() => undefined);
    else video.pause();
  }, [playing, src]);

  return (
    <video
      ref={ref}
      className="viewport__media"
      src={src}
      muted
      loop
      playsInline
      autoPlay={playing}
      preload="metadata"
      aria-hidden="true"
    />
  );
}
