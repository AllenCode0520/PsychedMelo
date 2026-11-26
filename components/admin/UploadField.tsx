'use client';

import { useId, useState, type ChangeEvent } from 'react';
import { formatDuration } from '@/lib/format';
import type { MediaKind } from '@/lib/types';
import { uploadFile } from '@/lib/upload-client';

function readAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      if (Number.isFinite(audio.duration)) resolve(Math.round(audio.duration));
      else reject(new Error('無法讀取長度'));
    };
    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('無法讀取音檔'));
    };
    audio.src = objectUrl;
  });
}

function Preview({ kind, url }: { kind: MediaKind; url: string }) {
  if (kind === 'audio') return <audio className="upload-preview" src={url} controls preload="none" />;
  if (kind === 'video') {
    return <video className="upload-preview" src={url} muted loop playsInline controls preload="metadata" />;
  }
  return <img className="upload-preview" src={url} alt="" />;
}

type Props = {
  name: string;
  kind: MediaKind;
  label: string;
  accept: string;
  required?: boolean;
  hint?: string;
  defaultValue?: string | null;
  /** 音檔上傳時，同時把長度（秒）寫進這個欄位。 */
  durationName?: string;
  defaultDuration?: number | null;
};

export function UploadField({
  name,
  kind,
  label,
  accept,
  required = false,
  hint,
  defaultValue,
  durationName,
  defaultDuration,
}: Props) {
  const id = useId();
  const [url, setUrl] = useState(defaultValue ?? '');
  const [duration, setDuration] = useState<number | null>(defaultDuration ?? null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setError(null);
    setProgress(0);
    try {
      if (durationName && kind === 'audio') {
        readAudioDuration(file)
          .then(setDuration)
          .catch(() => setDuration(null));
      }
      const result = await uploadFile(file, kind, setProgress);
      setUrl(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上傳失敗。');
    } finally {
      setProgress(null);
      input.value = '';
    }
  }

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
        {required && <span className="field__req"> 必填</span>}
      </label>
      <input type="hidden" name={name} value={url} />
      {durationName && <input type="hidden" name={durationName} value={duration ?? ''} />}

      {url && (
        <div className="upload-current">
          <Preview kind={kind} url={url} />
          <div className="upload-current__meta">
            {kind === 'audio' && duration ? (
              <span className="readout">{formatDuration(duration)}</span>
            ) : null}
            {!required && (
              <button type="button" className="btn btn--small" onClick={() => setUrl('')}>
                移除
              </button>
            )}
          </div>
        </div>
      )}

      <input
        id={id}
        type="file"
        accept={accept}
        onChange={onFileChange}
        disabled={progress !== null}
        required={required && !url}
        className="upload-input"
      />
      {progress !== null && (
        <progress value={progress} max={100} aria-label={`${label}上傳進度`}>
          {progress}%
        </progress>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {hint && <p className="field__hint">{hint}</p>}
    </div>
  );
}
