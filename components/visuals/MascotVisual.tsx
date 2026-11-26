'use client';

import { useEffect, useId, useRef } from 'react';
import { usePlayer } from '@/components/player/PlayerProvider';

const BARS = 56;
const CENTER = 160;
const BAR_INNER = 103;
const BAR_MAX = 34;
const BAR_COLORS = ['mv-pink', 'mv-teal', 'mv-amber', 'mv-lavender'];

/** 貓鹿旁邊一閃一滅的 Q（座標用 320×320 的視覺座標）。 */
const SPARKLE_QS = [
  { x: 262, y: 70, size: 24, delay: 0 },
  { x: 56, y: 92, size: 17, delay: 3 },
  { x: 284, y: 198, size: 15, delay: 6.4 },
  { x: 38, y: 212, size: 21, delay: 1.6 },
  { x: 238, y: 270, size: 18, delay: 4.8 },
  { x: 92, y: 280, size: 14, delay: 8 },
];

/** 兩隻眼睛在頭像（720×720）上的位置，眼皮蓋在這裡。 */
const EYES = [
  { cx: 287, cy: 416 },
  { cx: 455, cy: 416 },
];

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
  const uid = useId().replace(/:/g, '');
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
        <div className="mascot">
          <img className="mascot__base" src="/brand/mascot/base.webp" alt="" width={720} height={720} draggable={false} />
          <img className="mascot__part mascot__antler mascot__antler--left" src="/brand/mascot/antler-left.webp" alt="" draggable={false} />
          <img className="mascot__part mascot__antler mascot__antler--right" src="/brand/mascot/antler-right.webp" alt="" draggable={false} />
          <img className="mascot__part mascot__pom" src="/brand/mascot/pom.webp" alt="" draggable={false} />
          <svg className="mascot__eyes" viewBox="0 0 720 720" focusable="false">
            <defs>
              <linearGradient id={`${uid}-lid`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fd6a9b" />
                <stop offset="1" stopColor="#fb7d8a" />
              </linearGradient>
              {EYES.map((eye, i) => (
                <clipPath key={i} id={`${uid}-eye${i}`}>
                  <ellipse cx={eye.cx} cy={eye.cy} rx="48" ry="46" />
                </clipPath>
              ))}
            </defs>
            {EYES.map((eye, i) => (
              <g key={i}>
                <g clipPath={`url(#${uid}-eye${i})`}>
                  <rect className="mascot__lid" x={eye.cx - 50} y={eye.cy - 48} width="100" height="98" fill={`url(#${uid}-lid)`} />
                </g>
                <path
                  className="mascot__lash"
                  d={`M ${eye.cx - 38} ${eye.cy + 2} Q ${eye.cx} ${eye.cy + 22} ${eye.cx + 38} ${eye.cy + 2}`}
                />
              </g>
            ))}
          </svg>
        </div>
      </div>
      <svg viewBox="0 0 320 320" className="mv-qs" focusable="false">
        {SPARKLE_QS.map((q, i) => (
          <text
            key={i}
            className={`mv-q mv-q--${i % 4}`}
            x={q.x}
            y={q.y}
            fontSize={q.size}
            style={{ animationDelay: `${q.delay}s` }}
          >
            Q
          </text>
        ))}
      </svg>
    </div>
  );
}
