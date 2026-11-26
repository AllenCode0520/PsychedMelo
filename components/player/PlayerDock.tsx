'use client';

import Link from 'next/link';
import { ExpandIcon, NextIcon, PauseIcon, PlayIcon, PrevIcon, RepeatIcon, VolumeIcon } from '@/components/cockpit/Icons';
import { formatDuration } from '@/lib/format';
import { ExpandedViewport } from './ExpandedViewport';
import { usePlayer } from './PlayerProvider';

const REPEAT_LABEL = {
  off: '重複播放：關閉',
  all: '重複播放：全部循環',
  one: '重複播放：單曲循環',
} as const;

/** 畫面底部的控制台，全站常駐。 */
export function PlayerDock() {
  const player = usePlayer();
  const { current } = player;
  const status = current ? (player.playing ? 'Playing' : 'Paused') : 'Idle';

  return (
    <>
      <section className="dock" aria-label="播放控制台">
        <div className="shell dock__inner">
          <div className="dock__now">
            <span className={`led${player.playing ? ' is-on' : ''}`} aria-hidden="true" />
            <div className="dock__meta">
              <span className="hud-label">{status}</span>
              {current ? (
                <Link href={`/music/${current.slug}`} className="dock__title">
                  {current.title}
                </Link>
              ) : (
                <span className="dock__title is-idle">選一首歌開始播放</span>
              )}
              {current && <span className="dock__artist">{current.artist}</span>}
            </div>
          </div>

          <div className="dock__controls">
            <button type="button" className="icon-btn" onClick={player.prev} disabled={!current} aria-label="上一首">
              <PrevIcon />
            </button>
            <button
              type="button"
              className="icon-btn icon-btn--main"
              onClick={player.toggle}
              disabled={!current}
              aria-label={player.playing ? '暫停' : '播放'}
            >
              {player.playing ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={player.next}
              disabled={!current || !player.canNext}
              aria-label="下一首"
            >
              <NextIcon />
            </button>
          </div>

          <div className="dock__progress">
            <span className="readout" aria-hidden="true">
              {formatDuration(player.currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(0, Math.floor(player.duration))}
              step={1}
              value={Math.min(Math.floor(player.currentTime), Math.floor(player.duration))}
              onChange={(event) => player.seek(Number(event.target.value))}
              disabled={!current || !player.duration}
              aria-label="播放進度"
              aria-valuetext={`${formatDuration(player.currentTime)} / ${formatDuration(player.duration)}`}
            />
            <span className="readout" aria-hidden="true">
              {formatDuration(player.duration)}
            </span>
          </div>

          <div className="dock__extra">
            <button
              type="button"
              className={`icon-btn icon-btn--toggle${player.repeat !== 'off' ? ' is-active' : ''}`}
              onClick={player.cycleRepeat}
              aria-label={REPEAT_LABEL[player.repeat]}
              title={REPEAT_LABEL[player.repeat]}
            >
              <RepeatIcon size={18} one={player.repeat === 'one'} />
            </button>
            <label className="dock__volume">
              <VolumeIcon size={18} />
              <span className="visually-hidden">音量</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={player.volume}
                onChange={(event) => player.setVolume(Number(event.target.value))}
              />
            </label>
            <button
              type="button"
              className="icon-btn"
              onClick={() => player.setExpanded(true)}
              disabled={!current}
              aria-label="全螢幕播放"
              title="全螢幕播放"
            >
              <ExpandIcon />
            </button>
          </div>
        </div>
      </section>
      {player.expanded && current && <ExpandedViewport />}
    </>
  );
}
