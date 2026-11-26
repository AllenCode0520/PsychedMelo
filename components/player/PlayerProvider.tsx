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

export type RepeatMode = 'off' | 'all' | 'one';

const REPEAT_ORDER: RepeatMode[] = ['off', 'all', 'one'];

type PlayerContextValue = {
  queue: PlayerTrack[];
  index: number;
  current: PlayerTrack | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  expanded: boolean;
  repeat: RepeatMode;
  canNext: boolean;
  playQueue: (tracks: PlayerTrack[], startIndex?: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  setExpanded: (expanded: boolean) => void;
  cycleRepeat: () => void;
  /** 桌機上才有：讓舷窗視覺讀取正在播放的頻譜。手機回傳 null。 */
  getAnalyser: () => AnalyserNode | null;
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
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const current = queue[index] ?? null;
  const canNext = queue.length > 0 && (index < queue.length - 1 || repeat === 'all');

  /**
   * 把 <audio> 接到 Web Audio 分析器，讓視覺跟著音樂跳。
   * 只在有滑鼠的裝置（桌機）開啟：手機上接了之後，鎖定螢幕時瀏覽器會暫停 AudioContext，音樂就斷了。
   * 必須在點擊事件裡呼叫，瀏覽器才允許啟動 AudioContext。
   */
  const ensureAnalyser = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || typeof window === 'undefined') return;
    if (audioContextRef.current) {
      if (audioContextRef.current.state === 'suspended') void audioContextRef.current.resume();
      return;
    }
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    try {
      const context = new Ctx();
      const source = context.createMediaElementSource(audio);
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.78;
      source.connect(analyser);
      analyser.connect(context.destination);
      audioContextRef.current = context;
      analyserRef.current = analyser;
    } catch {
      // 不支援就算了，視覺會改用預設的呼吸動畫。
    }
  }, []);

  const getAnalyser = useCallback(() => analyserRef.current, []);

  const start = useCallback((track: PlayerTrack) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.dataset.trackId !== track.id) {
      audio.src = track.audio_url;
      audio.dataset.trackId = track.id;
      setCurrentTime(0);
      setDuration(track.duration_seconds ?? 0);
    }
    ensureAnalyser();
    audio.play().catch(() => setPlaying(false));
  }, [ensureAnalyser]);

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
    if (queue.length === 0) return;
    if (index >= queue.length - 1 && repeat !== 'all') return;
    const i = (index + 1) % queue.length;
    setIndex(i);
    start(queue[i]);
  }, [index, queue, repeat, start]);

  const cycleRepeat = useCallback(() => {
    setRepeat((mode) => REPEAT_ORDER[(REPEAT_ORDER.indexOf(mode) + 1) % REPEAT_ORDER.length]);
  }, []);

  const handleEnded = useCallback(() => {
    const audio = audioRef.current;
    if (repeat === 'one' && audio && current) {
      audio.currentTime = 0;
      audio.play().catch(() => setPlaying(false));
    } else if (index < queue.length - 1 || repeat === 'all') {
      next();
    } else {
      setPlaying(false);
    }
  }, [repeat, current, index, queue.length, next]);

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
      repeat,
      canNext,
      playQueue,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      setExpanded,
      cycleRepeat,
      getAnalyser,
    }),
    [
      queue,
      index,
      current,
      playing,
      currentTime,
      duration,
      volume,
      expanded,
      repeat,
      canNext,
      playQueue,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      cycleRepeat,
      getAnalyser,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          const seconds = event.currentTarget.duration;
          if (Number.isFinite(seconds)) setDuration(seconds);
        }}
        onEnded={handleEnded}
      />
    </PlayerContext.Provider>
  );
}
