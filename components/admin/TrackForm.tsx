'use client';

import { startTransition, useActionState, useState, type FormEvent } from 'react';
import { saveTrack, type FormState } from '@/app/admin/actions';
import type { Track, VisualType } from '@/lib/types';
import { UploadField } from './UploadField';

const VISUALS: { value: VisualType; label: string; hint: string }[] = [
  { value: 'psychedelic', label: '迷幻動畫', hint: '程式產生的旋轉圖樣（預設）' },
  { value: 'image', label: '圖片或 GIF', hint: 'GIF 會自動播放' },
  { value: 'video', label: '循環影片', hint: 'mp4 或 webm，靜音循環' },
];

export function TrackForm({ track }: { track?: Track | null }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveTrack, {});
  const [visualType, setVisualType] = useState<VisualType>(track?.visual_type ?? 'psychedelic');
  const [slug, setSlug] = useState(track?.slug ?? '');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      {track && <input type="hidden" name="id" value={track.id} />}
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}

      <div className="field">
        <label className="field__label" htmlFor="title">
          曲名<span className="field__req"> 必填</span>
        </label>
        <input id="title" name="title" type="text" required defaultValue={track?.title ?? ''} />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="slug">
          網址代稱<span className="field__req"> 必填</span>
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          value={slug}
          onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/\s+/g, '-'))}
          aria-describedby="slug-hint"
        />
        <p className="field__hint" id="slug-hint">
          英文小寫、數字、連字號，例如 purple-tide。網址會是 /music/{slug || 'purple-tide'}
        </p>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="artist">
          演出者
        </label>
        <input id="artist" name="artist" type="text" defaultValue={track?.artist ?? 'PsychedMelo'} />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="description">
          介紹
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={track?.description ?? ''}
          aria-describedby="description-hint"
        />
        <p className="field__hint" id="description-hint">
          會顯示在單曲頁，開頭約 140 字也會成為搜尋結果的描述。
        </p>
      </div>

      <UploadField
        name="audio_url"
        kind="audio"
        label="音檔"
        accept="audio/*"
        required
        defaultValue={track?.audio_url}
        durationName="duration_seconds"
        defaultDuration={track?.duration_seconds}
        hint="mp3、m4a、wav 都可以，上限 300 MB。網頁播放建議用 mp3 或 m4a。"
      />

      <UploadField
        name="cover_url"
        kind="image"
        label="封面圖（選填）"
        accept="image/*"
        defaultValue={track?.cover_url}
        hint="用在音軌列表與社群分享預覽，建議正方形、至少 1200×1200。"
      />

      <fieldset className="fieldset">
        <legend>舷窗視覺</legend>
        <div className="choice-row">
          {VISUALS.map((option) => (
            <label key={option.value} className="choice">
              <input
                type="radio"
                name="visual_type"
                value={option.value}
                checked={visualType === option.value}
                onChange={() => setVisualType(option.value)}
              />
              <span>
                <strong>{option.label}</strong>
                <small>{option.hint}</small>
              </span>
            </label>
          ))}
        </div>
        {visualType !== 'psychedelic' && (
          <UploadField
            key={visualType}
            name="visual_url"
            kind={visualType === 'image' ? 'image' : 'video'}
            label={visualType === 'image' ? '視覺圖片或 GIF' : '循環影片'}
            accept={visualType === 'image' ? 'image/*' : 'video/mp4,video/webm'}
            required
            defaultValue={track?.visual_type === visualType ? track.visual_url : null}
          />
        )}
      </fieldset>

      <div className="field field--narrow">
        <label className="field__label" htmlFor="sort_order">
          排序
        </label>
        <input
          id="sort_order"
          name="sort_order"
          type="number"
          defaultValue={track?.sort_order ?? 0}
          aria-describedby="sort-hint"
        />
        <p className="field__hint" id="sort-hint">
          數字小的排前面。
        </p>
      </div>

      <label className="check">
        <input type="checkbox" name="published" defaultChecked={track?.published ?? false} />
        發布（訪客看得到）
      </label>

      <div className="admin-form__actions">
        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? '儲存中…' : '儲存音軌'}
        </button>
      </div>
    </form>
  );
}
