'use client';

import type { FormEvent } from 'react';

export function DeleteButton({
  action,
  id,
  confirmText,
  label = '刪除',
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  confirmText: string;
  label?: string;
}) {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(confirmText)) event.preventDefault();
  }

  return (
    <form action={action} onSubmit={onSubmit}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="btn btn--danger btn--small">
        {label}
      </button>
    </form>
  );
}
