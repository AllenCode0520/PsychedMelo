'use client';

import { useEffect, useRef, type KeyboardEvent } from 'react';
import { CloseIcon, NextIcon, PauseIcon, PlayIcon, PrevIcon } from '@/components/cockpit/Icons';
import { Viewport } from '@/components/visuals/Viewport';
import { usePlayer } from './PlayerProvider';

/** 舷窗模式：全螢幕看視覺，按 Esc 或關閉鍵回到網頁。 */
export function ExpandedViewport() {
  const player = usePlayer();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, []);

  const { current } = player;
  if (!current) return null;

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') player.setExpanded(false);
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="全螢幕播放" onKeyDown={onKeyDown}>
      <div className="overlay__inner">
        <div className="overlay__top">
          <span className="hud-label">全螢幕播放</span>
          <button
            ref={closeRef}
            type="button"
            className="icon-btn"
            onClick={() => player.setExpanded(false)}
            aria-label="關閉全螢幕"
          >
            <CloseIcon />
          </button>
        </div>

        <Viewport
          source={current}
          playing={player.playing}
          shape="round"
          label={`${current.title} 的視覺`}
        />

        <div className="overlay__meta">
          <h2>{current.title}</h2>
          <p>{current.artist}</p>
        </div>

        <div className="overlay__controls">
          <button type="button" className="icon-btn" onClick={player.prev} aria-label="上一首">
            <PrevIcon />
          </button>
          <button
            type="button"
            className="icon-btn icon-btn--main"
            onClick={player.toggle}
            aria-label={player.playing ? '暫停' : '播放'}
          >
            {player.playing ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={player.next}
            disabled={!player.canNext}
            aria-label="下一首"
          >
            <NextIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
