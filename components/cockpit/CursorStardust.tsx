'use client';

import { useEffect, useRef } from 'react';

const COLORS = ['#ffd36b', '#ff9bd6', '#7fe6d2', '#b7a6ff', '#fff6d8'];
const NOTES = ['♪', '♫', '♩', '♬'];
const MAX_PARTICLES = 260;

type Particle = {
  kind: 'star' | 'note';
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  spin: number;
  angle: number;
  color: string;
  glyph: string;
};

/**
 * 滑鼠特效：游標拖出閃爍的小星塵，偶爾冒出音符往上飄。
 * 只在有滑鼠的裝置啟用；手機、平板和「減少動態效果」的使用者不會出現。
 * 畫在一層不攔截點擊的 canvas 上，沒有粒子時就停止動畫，不佔效能。
 */
export function CursorStardust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches || reduceMotion.matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Particle[] = [];
    let frame = 0;
    let running = false;
    let last = performance.now();
    let lastX = -1;
    let lastY = -1;
    let distanceSinceNote = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const rand = (min: number, max: number) => min + Math.random() * (max - min);
    const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

    const spawnStar = (x: number, y: number, speed: number) => {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      const maxLife = rand(0.6, 1.2);
      particles.push({
        kind: 'star',
        x: x + rand(-4, 4),
        y: y + rand(-4, 4),
        vx: rand(-30, 30) + speed * rand(-0.05, 0.05),
        vy: rand(-25, 15),
        life: maxLife,
        maxLife,
        size: rand(1.6, 4.2),
        spin: rand(-4, 4),
        angle: rand(0, Math.PI),
        color: pick(COLORS),
        glyph: '',
      });
    };

    const spawnNote = (x: number, y: number) => {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      const maxLife = rand(1.4, 2.2);
      particles.push({
        kind: 'note',
        x,
        y,
        vx: rand(-12, 12),
        vy: rand(-55, -35),
        life: maxLife,
        maxLife,
        size: rand(14, 20),
        spin: rand(-0.6, 0.6),
        angle: rand(-0.3, 0.3),
        color: pick(COLORS),
        glyph: pick(NOTES),
      });
    };

    const drawStar = (p: Particle, alpha: number) => {
      const r = p.size;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      // 四角星
      ctx.beginPath();
      ctx.moveTo(0, -r * 2);
      ctx.quadraticCurveTo(0, 0, r * 2, 0);
      ctx.quadraticCurveTo(0, 0, 0, r * 2);
      ctx.quadraticCurveTo(0, 0, -r * 2, 0);
      ctx.quadraticCurveTo(0, 0, 0, -r * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawNote = (p: Particle, alpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.font = `${p.size}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.glyph, 0, 0);
      ctx.restore();
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const t = p.life / p.maxLife;
        if (p.kind === 'star') {
          p.vy += 70 * dt; // 輕輕往下灑落
          p.vx *= 0.96;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.angle += p.spin * dt;
          const twinkle = 0.65 + 0.35 * Math.sin(now / 60 + i);
          drawStar(p, t * twinkle);
        } else {
          p.x += (p.vx + Math.sin(now / 300 + i) * 18) * dt; // 左右搖擺往上飄
          p.y += p.vy * dt;
          p.angle += p.spin * dt;
          drawNote(p, Math.min(1, t * 1.6));
        }
      }

      if (particles.length > 0) {
        frame = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const ensureRunning = () => {
      if (running) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const { clientX: x, clientY: y } = event;
      if (lastX < 0) {
        lastX = x;
        lastY = y;
        return;
      }
      const dist = Math.hypot(x - lastX, y - lastY);
      const count = Math.min(5, Math.floor(dist / 9));
      for (let i = 0; i < count; i++) {
        const f = (i + 1) / count;
        spawnStar(lastX + (x - lastX) * f, lastY + (y - lastY) * f, dist);
      }
      distanceSinceNote += dist;
      if (distanceSinceNote > 220 && Math.random() < 0.35) {
        spawnNote(x, y - 6);
        distanceSinceNote = 0;
      }
      lastX = x;
      lastY = y;
      if (count > 0) ensureRunning();
    };

    const onLeave = () => {
      lastX = -1;
      lastY = -1;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="cursor-stardust" aria-hidden="true" />;
}
