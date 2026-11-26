'use client';

import { useId, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { mediaKindOf, uploadFile } from '@/lib/upload-client';

export function MediaUploader() {
  const id = useId();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      for (const [index, file] of files.entries()) {
        const kind = mediaKindOf(file);
        if (!kind) throw new Error(`不支援這個檔案：${file.name}`);
        setMessage(`上傳中 ${index + 1} / ${files.length}：${file.name}`);
        await uploadFile(file, kind, setProgress);
      }
      setMessage(`已上傳 ${files.length} 個檔案。`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '上傳失敗。');
      setMessage(null);
    } finally {
      setBusy(false);
      setProgress(0);
      input.value = '';
    }
  }

  return (
    <div className="panel admin-section">
      <div className="field">
        <label className="field__label" htmlFor={id}>
          上傳檔案
        </label>
        <input
          id={id}
          type="file"
          multiple
          accept="audio/*,image/*,video/mp4,video/webm"
          onChange={onChange}
          disabled={busy}
          className="upload-input"
        />
        <p className="field__hint">可以一次選多個：音檔、圖片、GIF、mp4 或 webm 影片。</p>
      </div>
      {busy && <progress value={progress} max={100} aria-label="上傳進度" />}
      <p className="form-status" role="status">
        {message}
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
