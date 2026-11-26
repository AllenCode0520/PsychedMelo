'use client';

import { useState } from 'react';

export function CopyButton({ text, label = '複製網址' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt('複製這個網址：', text);
    }
  }

  return (
    <button type="button" className="btn btn--small" onClick={onClick}>
      <span aria-live="polite">{copied ? '已複製' : label}</span>
    </button>
  );
}
