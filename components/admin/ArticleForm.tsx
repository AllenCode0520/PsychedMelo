'use client';

import { startTransition, useActionState, useEffect, useState, type FormEvent } from 'react';
import { saveArticle, type FormState } from '@/app/admin/actions';
import type { Article, ArticleStatus } from '@/lib/types';
import { DocxImport, type ImportedDoc } from './DocxImport';
import { UploadField } from './UploadField';

const META_TITLE_MAX = 60;
const META_DESCRIPTION_MAX = 160;

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIso(local: string): string {
  if (!local) return '';
  const date = new Date(local);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function Counter({ length, max }: { length: number; max: number }) {
  return (
    <span className={`field__count${length > max ? ' is-over' : ''}`}>
      {length} / {max}
    </span>
  );
}

export function ArticleForm({ article }: { article?: Article | null }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveArticle, {});
  const [slug, setSlug] = useState(article?.slug ?? '');
  const [status, setStatus] = useState<ArticleStatus>(article?.status ?? 'draft');
  const [metaTitle, setMetaTitle] = useState(article?.meta_title ?? '');
  const [metaDescription, setMetaDescription] = useState(article?.meta_description ?? '');
  const [title, setTitle] = useState(article?.title ?? '');
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '');
  const [contentHtml, setContentHtml] = useState(article?.content_html ?? '');

  function onImported(doc: ImportedDoc) {
    setContentHtml(doc.html);
    if (doc.title) setTitle(doc.title);
    if (!excerpt.trim() && doc.firstParagraph) setExcerpt(doc.firstParagraph.slice(0, 140));
  }
  // 時間要用瀏覽器的時區顯示，所以掛載後才填入。
  const [publishedLocal, setPublishedLocal] = useState('');
  useEffect(() => {
    setPublishedLocal(toLocalInput(article?.published_at));
  }, [article?.published_at]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form className="admin-form admin-form--wide" onSubmit={onSubmit}>
      {article && <input type="hidden" name="id" value={article.id} />}
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}

      <div className="field">
        <label className="field__label" htmlFor="title">
          標題<span className="field__req"> 必填</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
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
          英文小寫、數字、連字號，最好包含文章關鍵字。網址會是 /articles/{slug || 'lofi-for-focus'}
        </p>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="excerpt">
          摘要
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
          aria-describedby="excerpt-hint"
        />
        <p className="field__hint" id="excerpt-hint">
          顯示在文章列表。沒填 SEO 描述時，也會拿來當搜尋結果的描述。
        </p>
      </div>

      <UploadField
        name="cover_url"
        kind="image"
        label="封面圖（選填）"
        accept="image/*"
        defaultValue={article?.cover_url}
        hint="也會用在社群分享預覽，建議 1200×630。"
      />

      <fieldset className="fieldset">
        <legend>內文（從 Word 匯入）</legend>
        <DocxImport onImported={onImported} hasContent={Boolean(contentHtml)} />
        <input type="hidden" name="content_html" value={contentHtml} />
        {contentHtml ? (
          <div className="docx-preview">
            <p className="hud-label">預覽 · 實際樣式以文章頁為準</p>
            <div className="prose" dangerouslySetInnerHTML={{ __html: contentHtml }} />
          </div>
        ) : (
          <p className="empty-note">還沒有內文。上傳 Word 檔後會在這裡預覽。</p>
        )}
      </fieldset>

      <fieldset className="fieldset">
        <legend>搜尋引擎（SEO）</legend>
        <div className="field">
          <div className="field__row">
            <label className="field__label" htmlFor="meta_title">
              SEO 標題
            </label>
            <Counter length={metaTitle.length} max={META_TITLE_MAX} />
          </div>
          <input
            id="meta_title"
            name="meta_title"
            type="text"
            value={metaTitle}
            onChange={(event) => setMetaTitle(event.target.value)}
            aria-describedby="meta-title-hint"
          />
          <p className="field__hint" id="meta-title-hint">
            留空就用文章標題。中文建議 30 字以內。
          </p>
        </div>
        <div className="field">
          <div className="field__row">
            <label className="field__label" htmlFor="meta_description">
              SEO 描述
            </label>
            <Counter length={metaDescription.length} max={META_DESCRIPTION_MAX} />
          </div>
          <textarea
            id="meta_description"
            name="meta_description"
            rows={3}
            value={metaDescription}
            onChange={(event) => setMetaDescription(event.target.value)}
            aria-describedby="meta-description-hint"
          />
          <p className="field__hint" id="meta-description-hint">
            搜尋結果標題下面那段文字。中文建議 80 字左右。
          </p>
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend>發布</legend>
        <div className="choice-row">
          <label className="choice">
            <input
              type="radio"
              name="status"
              value="draft"
              checked={status === 'draft'}
              onChange={() => setStatus('draft')}
            />
            <span>
              <strong>草稿</strong>
              <small>只有你看得到</small>
            </span>
          </label>
          <label className="choice">
            <input
              type="radio"
              name="status"
              value="published"
              checked={status === 'published'}
              onChange={() => setStatus('published')}
            />
            <span>
              <strong>發布</strong>
              <small>訪客與搜尋引擎看得到</small>
            </span>
          </label>
        </div>
        <div className="field field--narrow">
          <label className="field__label" htmlFor="published_local">
            發布時間
          </label>
          <input
            id="published_local"
            type="datetime-local"
            value={publishedLocal}
            onChange={(event) => setPublishedLocal(event.target.value)}
            aria-describedby="published-hint"
          />
          <input type="hidden" name="published_at" value={toIso(publishedLocal)} />
          <p className="field__hint" id="published-hint">
            留空會用按下儲存的時間。設定未來時間，就會到那時才出現在網站上。
          </p>
        </div>
      </fieldset>

      <div className="admin-form__actions">
        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? '儲存中…' : status === 'published' ? '儲存並發布' : '儲存草稿'}
        </button>
      </div>
    </form>
  );
}
