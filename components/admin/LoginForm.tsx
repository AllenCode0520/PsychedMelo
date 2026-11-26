'use client';

import { startTransition, useActionState, type FormEvent } from 'react';
import { login, type FormState } from '@/app/admin/actions';

export function LoginForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(login, {});

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <div className="field">
        <label className="field__label" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div className="field">
        <label className="field__label" htmlFor="password">
          密碼
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <button type="submit" className="btn btn--primary" disabled={pending}>
        {pending ? '驗證中…' : '登入艦橋'}
      </button>
    </form>
  );
}
