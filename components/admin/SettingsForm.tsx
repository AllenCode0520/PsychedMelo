'use client';

import { startTransition, useActionState, type FormEvent } from 'react';
import { saveSettings, type FormState } from '@/app/admin/actions';
import type { SiteSettings } from '@/lib/types';
import { RichTextEditor } from './RichTextEditor';
import { UploadField } from './UploadField';

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveSettings, {});

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form className="admin-form admin-form--wide" onSubmit={onSubmit}>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="form-ok" role="status">
          {state.message}
        </p>
      )}

      <div className="field">
        <label className="field__label" htmlFor="site_name">
          網站名稱<span className="field__req"> 必填</span>
        </label>
        <input id="site_name" name="site_name" type="text" required defaultValue={settings.site_name} />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="tagline">
          標語
        </label>
        <input id="tagline" name="tagline" type="text" defaultValue={settings.tagline} />
        <p className="field__hint">顯示在首頁主控台，也會接在首頁的網頁標題後面。</p>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="default_description">
          網站描述
        </label>
        <textarea
          id="default_description"
          name="default_description"
          rows={3}
          defaultValue={settings.default_description}
        />
        <p className="field__hint">首頁和沒有自己描述的頁面，會用這段當搜尋結果描述。</p>
      </div>

      <UploadField
        name="hero_image_url"
        kind="image"
        label="首頁舷窗主視覺"
        accept="image/*"
        defaultValue={settings.hero_image_url}
        hint="沒有播放音樂時，首頁舷窗會顯示這張圖。建議 16:9、寬 1920 以上，GIF 也可以。留空就用內建的 Psychedmelo 主視覺。"
      />

      <RichTextEditor
        name="about_html"
        label="艦長檔案（關於頁內容）"
        initialHtml={settings.about_html}
      />

      <div className="field">
        <label className="field__label" htmlFor="social_links">
          社群連結
        </label>
        <textarea
          id="social_links"
          name="social_links"
          rows={4}
          defaultValue={settings.social_links.map((link) => `${link.label} | ${link.url}`).join('\n')}
          aria-describedby="social-hint"
        />
        <p className="field__hint" id="social-hint">
          一行一個，格式「名稱 | 網址」，例如「Instagram | https://instagram.com/你的帳號」。會顯示在頁尾。
        </p>
      </div>

      <div className="admin-form__actions">
        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? '儲存中…' : '儲存設定'}
        </button>
      </div>
    </form>
  );
}
