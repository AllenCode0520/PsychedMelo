import type { CSSProperties } from 'react';

const COUNT = 70;
const COLORS = ['#ffffff', '#ffffff', '#fff3c9', '#ffd36b', '#7fe6d2', '#ff9bd6', '#b7a6ff'];

/** 固定種子的亂數：伺服器和瀏覽器算出同一片星空，避免畫面閃動。 */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

type Star = { key: number; style: CSSProperties; bright: boolean };

const STARS: Star[] = (() => {
  const rand = seeded(84);
  return Array.from({ length: COUNT }, (_, i) => {
    const size = rand() < 0.12 ? 2.4 + rand() * 1.2 : 1 + rand() * 1.1;
    const drift = 6 + rand() * 18;
    const angle = rand() * Math.PI * 2;
    return {
      key: i,
      bright: size > 2.3,
      style: {
        left: `${(rand() * 100).toFixed(2)}%`,
        top: `${(rand() * 100).toFixed(2)}%`,
        width: `${size.toFixed(2)}px`,
        height: `${size.toFixed(2)}px`,
        color: COLORS[Math.floor(rand() * COLORS.length)],
        '--tw': `${(2 + rand() * 4).toFixed(2)}s`,
        '--td': `${(-rand() * 6).toFixed(2)}s`,
        '--dx': `${(Math.cos(angle) * drift).toFixed(1)}px`,
        '--dy': `${(Math.sin(angle) * drift).toFixed(1)}px`,
        '--dd': `${(14 + rand() * 22).toFixed(1)}s`,
        '--ddl': `${(-rand() * 30).toFixed(1)}s`,
      } as CSSProperties,
    };
  });
})();

/** 舷窗外的星空：每顆星各自一閃一滅，並緩緩游離。 */
export function StarField() {
  return (
    <div className="viewport__stars" aria-hidden="true">
      {STARS.map((star) => (
        <span key={star.key} className={`star${star.bright ? ' star--bright' : ''}`} style={star.style} />
      ))}
    </div>
  );
}
