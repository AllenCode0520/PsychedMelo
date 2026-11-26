const PETALS = Array.from({ length: 12 }, (_, i) => i * 30);
const LOBES = Array.from({ length: 6 }, (_, i) => i * 60);

/** 預設的舷窗視覺：程式畫的旋轉同心圓與花瓣，不需要任何檔案。 */
export function PsychedelicVisual({
  playing = true,
  className = '',
}: {
  playing?: boolean;
  className?: string;
}) {
  const classes = ['pv', playing ? '' : 'is-paused', className].filter(Boolean).join(' ');

  return (
    <svg viewBox="0 0 320 320" className={classes} aria-hidden="true" focusable="false">
      <g className="pv-cw">
        <circle className="pv-amber" cx="160" cy="160" r="152" strokeWidth="4" strokeDasharray="2 13" strokeLinecap="round" />
        <circle className="pv-pink" cx="160" cy="160" r="128" strokeWidth="3" strokeDasharray="42 12" strokeLinecap="round" />
        <circle className="pv-teal" cx="160" cy="160" r="104" strokeWidth="5" strokeDasharray="1 10" strokeLinecap="round" />
        <circle className="pv-amber" cx="160" cy="160" r="58" strokeWidth="3" strokeDasharray="6 6" />
      </g>
      <g className="pv-ccw">
        <circle className="pv-lavender" cx="160" cy="160" r="140" strokeWidth="1.5" strokeDasharray="3 17" strokeLinecap="round" />
        <circle className="pv-amber" cx="160" cy="160" r="116" strokeWidth="1.5" strokeDasharray="64 22" strokeLinecap="round" />
        <circle className="pv-pink" cx="160" cy="160" r="80" strokeWidth="2.5" strokeDasharray="22 8" strokeLinecap="round" />
      </g>
      <g className="pv-ccw pv-slow">
        {PETALS.map((deg) => (
          <ellipse key={deg} className="pv-pink" cx="160" cy="92" rx="20" ry="62" strokeWidth="1.6" transform={`rotate(${deg} 160 160)`} />
        ))}
      </g>
      <g className="pv-cw pv-slow">
        {LOBES.map((deg) => (
          <ellipse key={deg} className="pv-teal" cx="160" cy="76" rx="34" ry="80" strokeWidth="1" transform={`rotate(${deg} 160 160)`} />
        ))}
      </g>
      <g className="pv-breathe">
        <circle className="pv-core" cx="160" cy="160" r="28" />
        <circle className="pv-hole" cx="160" cy="160" r="9" />
      </g>
    </svg>
  );
}
