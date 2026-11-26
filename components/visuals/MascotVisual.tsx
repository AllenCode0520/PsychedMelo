'use client';

import { useEffect, useRef } from 'react';
import { usePlayer } from '@/components/player/PlayerProvider';

const BARS = 56;
const CENTER = 160;
const BAR_INNER = 103;
const BAR_MAX = 34;
const BAR_COLORS = ['mv-pink', 'mv-teal', 'mv-amber', 'mv-lavender'];

/** 每根頻譜條的方向，只算一次。 */
const ANGLES = Array.from({ length: BARS }, (_, i) => (i / BARS) * Math.PI * 2 - Math.PI / 2);

/**
 * 預設的舷窗視覺：貓鹿吉祥物在中央，外圈的頻譜光環跟著音樂跳，整體色相緩慢流轉。
 * 桌機會讀真正的頻譜；手機（或還沒按過播放）就用模擬的律動，視覺一樣會動。
 * 所有逐格更新都直接改 DOM / CSS 變數，不經過 React 重繪。
 */
export function MascotVisual({ playing = true, className = '' }: { playing?: boolean; className?: string }) {
  const { getAnalyser, playing: audioPlaying } = usePlayer();
  const rootRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<(SVGLineElement | null)[]>([]);
  const activeRef = useRef(false);
  activeRef.current = playing && audioPlaying;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const levels = new Float32Array(BARS);
    let data: Uint8Array<ArrayBuffer> | null = null;
    let bass = 0;
    let high = 0;
    let frame = 0;

    const drawBars = () => {
      for (let i = 0; i < BARS; i++) {
        const line = barRefs.current[i];
        if (!line) continue;
        const length = 3 + levels[i] * BAR_MAX;
        const a = ANGLES[i];
        line.setAttribute('x2', (CENTER + Math.cos(a) * (BAR_INNER + length)).toFixed(1));
        line.setAttribute('y2', (CENTER + Math.sin(a) * (BAR_INNER + length)).toFixed(1));
      }
      root.style.setProperty('--bass', bass.toFixed(3));
      root.style.setProperty('--high', high.toFixed(3));
    };

    if (reduceMotion) {
      drawBars();
      return;
    }

    const tick = (time: number) => {
      const analyser = getAnalyser();
      const active = activeRef.current;
      let targetBass = 0;
      let targetHigh = 0;

      if (active && analyser) {
        if (!data || data.length !== analyser.frequencyBinCount) data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        // 只取前 70% 的頻段（再上面幾乎沒有能量），左右鏡像讓光環對稱。
        const usable = Math.floor(data.length * 0.7);
        const half = BARS / 2;
        for (let i = 0; i < BARS; i++) {
          const k = i < half ? i : BARS - 1 - i;
          const bin = Math.floor(Math.pow(k / half, 1.6) * usable);
          const v = data[bin] / 255;
          levels[i] += (v * v - levels[i]) * 0.35;
        }
        for (let b = 1; b < 6; b++) targetBass += data[b];
        targetBass = targetBass / (5 * 255);
        for (let b = 40; b < 110; b++) targetHigh += data[b];
        targetHigh = targetHigh / (70 * 255);
      } else {
        // 沒有頻譜可讀：播放中用模擬律動，暫停時慢慢歸零。
        const t = time / 1000;
        for (let i = 0; i < BARS; i++) {
          const wave = active
            ? 0.22 + 0.18 * Math.sin(t * 2.1 + i * 0.45) * Math.sin(t * 0.7 + i * 0.13) + 0.12 * Math.max(0, Math.sin(t * 3.6))
            : 0.04;
          levels[i] += (wave - levels[i]) * 0.08;
        }
        targetBass = active ? 0.35 + 0.25 * Math.max(0, Math.sin(t * 3.6)) : 0;
        targetHigh = active ? 0.25 + 0.1 * Math.sin(t * 1.3) : 0;
      }

      bass += (targetBass - bass) * 0.25;
      high += (targetHigh - high) * 0.15;
      drawBars();
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [getAnalyser]);

  const classes = ['mv', playing ? '' : 'is-paused', className].filter(Boolean).join(' ');

  return (
    <div ref={rootRef} className={classes} aria-hidden="true">
      <div className="mv-aura" />
      <svg viewBox="0 0 320 320" className="mv-rings" focusable="false">
        <g className="mv-spin">
          <circle className="mv-amber" cx="160" cy="160" r="152" strokeWidth="4" strokeDasharray="2 13" strokeLinecap="round" />
          <circle className="mv-teal" cx="160" cy="160" r="141" strokeWidth="1.5" strokeDasharray="30 10" strokeLinecap="round" />
        </g>
        <g className="mv-spin mv-spin--reverse">
          <circle className="mv-pink" cx="160" cy="160" r="146" strokeWidth="2" strokeDasharray="1 9" strokeLinecap="round" />
          <circle className="mv-lavender" cx="160" cy="160" r="99" strokeWidth="1.2" strokeDasharray="3 7" />
        </g>
        <g className="mv-bars">
          {ANGLES.map((a, i) => (
            <line
              key={i}
              ref={(el) => {
                barRefs.current[i] = el;
              }}
              className={BAR_COLORS[i % BAR_COLORS.length]}
              x1={(CENTER + Math.cos(a) * BAR_INNER).toFixed(1)}
              y1={(CENTER + Math.sin(a) * BAR_INNER).toFixed(1)}
              x2={(CENTER + Math.cos(a) * (BAR_INNER + 3)).toFixed(1)}
              y2={(CENTER + Math.sin(a) * (BAR_INNER + 3)).toFixed(1)}
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          ))}
        </g>
      </svg>
      <div className="mv-halo" />
      <div className="mv-face">
        <img src="/brand/mascot.webp" alt="" width={640} height={640} draggable={false} />
      </div>
    </div>
  );
}
