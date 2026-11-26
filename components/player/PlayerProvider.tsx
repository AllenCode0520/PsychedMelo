'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { PlayerTrack } from '@/lib/types';

type PlayerContextValue = {
  queue: PlayerTrack[];
  index: number;
  current: PlayerTrack | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  expanded: boolean;
  playQueue: (tracks: PlayerTrack[], startIndex?: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  setExpanded: (expanded: boolean) => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer 必須放在 PlayerProvider 裡面使用');
  return context;
}

/**
 * 全站共用的播放器。放在前台的 layout 裡，換頁時不會被重新建立，所以音樂不會中斷。
 * play() 直接在點擊事件裡呼叫，iOS Safari 才允許播放。
 */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [expanded, setExpanded] = useState(false);
  const current = queue[index] ?? null;

  const start = useCallback((track: PlayerTrack) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.dataset.trackId !== track.id) {
      audio.src = track.audio_url;
      audio.dataset.trackId = track.id;
      setCurrentTime(0);
      setDuration(track.duration_seconds ?? 0);
    }
    audio.play().catch(() => setPlaying(false));
  }, []);

  const playQueue = useCallback(
    (tracks: PlayerTrack[], startIndex = 0) => {
      if (tracks.length === 0) return;
      const i = Math.min(Math.max(startIndex, 0), tracks.length - 1);
      setQueue(tracks);
      setIndex(i);
      start(tracks[i]);
    },
    [start],
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.paused) start(current);
    else audio.pause();
  }, [current, start]);

  const next = useCallback(() => {
    if (index >= queue.length - 1) return;
    const i = index + 1;
    setIndex(i);
    start(queue[i]);
  }, [index, queue, start]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && (audio.currentTime > 3 || index === 0)) {
      audio.currentTime = 0;
      return;
    }
    const i = index - 1;
    if (i < 0) return;
    setIndex(i);
    start(queue[i]);
  }, [index, queue, start]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(seconds)) return;
    audio.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const setVolume = useCallback((value: number) => {
    setVolumeState(Math.min(1, Math.max(0, value)));
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // 鎖定畫面與耳機按鍵的控制
  useEffect(() => {
    if (!current || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.artist,
      artwork: current.cover_url ? [{ src: current.cover_url }] : [],
    });
  }, [current]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const session = navigator.mediaSession;
    const handlers: [MediaSessionAction, () => void][] = [
      ['play', toggle],
      ['pause', toggle],
      ['nexttrack', next],
      ['previoustrack', prev],
    ];
    for (const [action, handler] of handlers) {
      try {
        session.setActionHandler(action, handler);
      } catch {
        // 有些瀏覽器不支援某些按鍵，略過即可。
      }
    }
    return () => {
      for (const [action] of handlers) {
        try {
          session.setActionHandler(action, null);
        } catch {
          // 同上
        }
      }
    };
  }, [toggle, next, prev]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      queue,
      index,
      current,
      playing,
      currentTime,
      duration,
      volume,
      expanded,
      playQueue,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      setExpanded,
    }),
    [queue, index, current, playing, currentTime, duration, volume, expanded, playQueue, toggle, next, prev, seek, setVolume],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          const seconds = event.currentTarget.duration;
          if (Number.isFinite(seconds)) setDuration(seconds);
        }}
        onEnded={() => {
          if (index < queue.length - 1) next();
          else setPlaying(false);
        }}
      />
    </PlayerContext.Provider>
  );
}
