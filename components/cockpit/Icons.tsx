import type { SVGProps } from 'react';

type IconProps = { size?: number };

function base(size = 20): SVGProps<SVGSVGElement> {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: false,
  };
}

export function PlayIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <polygon points="7 4 20 12 7 20 7 4" fill="currentColor" />
    </svg>
  );
}

export function PauseIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
      <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
    </svg>
  );
}

export function PrevIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <polygon points="19 20 9 12 19 4 19 20" fill="currentColor" />
      <line x1="5" y1="19" x2="5" y2="5" />
    </svg>
  );
}

export function NextIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" />
      <line x1="19" y1="5" x2="19" y2="19" />
    </svg>
  );
}

export function VolumeIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 5a10 10 0 0 1 0 14" />
    </svg>
  );
}

export function ExpandIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

export function RepeatIcon({ size, one = false }: IconProps & { one?: boolean }) {
  return (
    <svg {...base(size)}>
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11V9a3 3 0 0 1 3-3h15" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v2a3 3 0 0 1-3 3H3" />
      {one && (
        <text x="12" y="14.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor" stroke="none">
          1
        </text>
      )}
    </svg>
  );
}

export function CloseIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

export function RingMark({ size = 26 }: IconProps) {
  return (
    <svg {...base(size)} viewBox="0 0 26 26" strokeWidth={2}>
      <circle cx="13" cy="13" r="11" strokeDasharray="3 3" />
      <circle cx="13" cy="13" r="6" />
      <circle cx="13" cy="13" r="2" fill="currentColor" />
    </svg>
  );
}
