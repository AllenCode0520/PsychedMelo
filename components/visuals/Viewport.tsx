import type { ReactNode } from 'react';
import type { VisualType } from '@/lib/types';
import { MascotVisual } from './MascotVisual';
import { StarField } from './StarField';
import { ViewportVideo } from './ViewportVideo';

export type VisualSource = {
  visual_type: VisualType;
  visual_url: string | null;
};

/**
 * 每一種視覺來源怎麼畫。之後要加新格式（例如 Lottie 動畫），
 * 在 VisualType 加一個值、在這裡加一個 renderer，再更新資料庫的 check 條件即可。
 */
const RENDERERS: Record<VisualType, (source: VisualSource, playing: boolean) => ReactNode> = {
  psychedelic: (_source, playing) => <MascotVisual playing={playing} />,
  image: (source, playing) =>
    source.visual_url ? (
      <img className="viewport__media" src={source.visual_url} alt="" />
    ) : (
      <MascotVisual playing={playing} />
    ),
  video: (source, playing) =>
    source.visual_url ? (
      <ViewportVideo src={source.visual_url} playing={playing} />
    ) : (
      <MascotVisual playing={playing} />
    ),
};

export function Viewport({
  source,
  playing = true,
  shape = 'wide',
  label,
}: {
  source?: VisualSource | null;
  playing?: boolean;
  shape?: 'wide' | 'round' | 'screen';
  label: string;
}) {
  const resolved: VisualSource = source ?? { visual_type: 'psychedelic', visual_url: null };
  const render = RENDERERS[resolved.visual_type] ?? RENDERERS.psychedelic;

  return (
    <div className={`viewport viewport--${shape}`} role="img" aria-label={label}>
      <StarField />
      <div className="viewport__content" aria-hidden="true">
        {render(resolved, playing)}
      </div>
      <div className="viewport__glass" aria-hidden="true" />
    </div>
  );
}
