'use client';

import { useId, useState, type ChangeEvent } from 'react';
import { uploadFile } from '@/lib/upload-client';

export type ImportedDoc = {
  /** Word 第一個「標題 1」（或「標題」樣式）的文字；沒有就是空字串。 */
  title: string;
  /** 第一段內文的純文字，可以當摘要。 */
  firstParagraph: string;
  /** 轉好的內文 HTML（已拿掉當標題用的那一行）。 */
  html: string;
};

/** 瀏覽器顯示不了的 Word 圖片格式，略過不上傳。 */
const UNSUPPORTED_IMAGE = /(x-emf|x-wmf|emf|wmf|tiff)$/i;

const STYLE_MAP = [
  "p[style-name='Title'] => h1:fresh",
  "p[style-name='標題'] => h1:fresh",
  "p[style-name='Subtitle'] => p:fresh",
  "p[style-name='副標題'] => p:fresh",
];

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** 文章頁的 h1 是文章標題，所以內文裡的標題往下降一級。 */
function splitTitle(rawHtml: string): ImportedDoc {
  const doc = new DOMParser().parseFromString(`<body>${rawHtml}</body>`, 'text/html');
  const body = doc.body;

  let title = '';
  const firstH1 = body.querySelector('h1');
  if (firstH1) {
    title = firstH1.textContent?.trim() ?? '';
    firstH1.remove();
  }

  for (const level of [5, 4, 3, 2, 1]) {
    body.querySelectorAll(`h${level}`).forEach((heading) => {
      const replacement = doc.createElement(`h${Math.min(level + 1, 4)}`);
      replacement.innerHTML = heading.innerHTML;
      heading.replaceWith(replacement);
    });
  }
  body.querySelectorAll('img[src=""]').forEach((img) => img.remove());
  body.querySelectorAll('p').forEach((p) => {
    if (!p.textContent?.trim() && !p.querySelector('img')) p.remove();
  });

  const firstParagraph = body.querySelector('p')?.textContent?.trim() ?? '';
  return { title, firstParagraph, html: body.innerHTML.trim() };
}

export function DocxImport({
  onImported,
  hasContent,
}: {
  onImported: (doc: ImportedDoc) => void;
  hasContent: boolean;
}) {
  const id = useId();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function onChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    if (!/\.docx$/i.test(file.name)) {
      setError('請選擇 .docx 格式的 Word 檔（舊版 .doc 請先在 Word 另存成 .docx）。');
      input.value = '';
      return;
    }

    setBusy(true);
    setError(null);
    setWarnings([]);
    setStatus(`讀取中：${file.name}`);
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      let imageCount = 0;
      const skipped: string[] = [];

      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          styleMap: STYLE_MAP,
          convertImage: mammoth.images.imgElement(async (image) => {
            const type = image.contentType || 'image/png';
            if (!type.startsWith('image/') || UNSUPPORTED_IMAGE.test(type)) {
              skipped.push(type);
              return { src: '' };
            }
            imageCount += 1;
            setStatus(`上傳 Word 裡的第 ${imageCount} 張圖片…`);
            const bytes = base64ToBytes(await image.read('base64'));
            const ext = type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'png';
            const imageFile = new File([bytes], `word-image-${imageCount}.${ext}`, { type });
            const uploaded = await uploadFile(imageFile, 'image');
            const altText = (image as { altText?: string }).altText;
            return altText ? { src: uploaded.url, alt: altText } : { src: uploaded.url };
          }),
        },
      );

      const imported = splitTitle(result.value);
      if (!imported.html) throw new Error('這份 Word 檔裡沒有讀到內文。');

      const notes = result.messages
        .filter((message) => message.type === 'warning')
        .map((message) => message.message);
      if (skipped.length > 0) {
        notes.unshift(`有 ${skipped.length} 張圖片是瀏覽器無法顯示的格式（例如 EMF），已略過。請在 Word 裡把它們另存成 PNG 或 JPG 再插入。`);
      }
      if (!imported.title) {
        notes.unshift('沒有找到「標題 1」樣式的段落，請自己填寫文章標題。');
      }
      setWarnings(notes.slice(0, 6));
      onImported(imported);
      setStatus(`已匯入「${file.name}」${imageCount ? `，上傳了 ${imageCount} 張圖片` : ''}。記得按下方的儲存。`);
    } catch (err) {
      setStatus(null);
      setError(err instanceof Error ? `匯入失敗：${err.message}` : '匯入失敗。');
    } finally {
      setBusy(false);
      input.value = '';
    }
  }

  return (
    <div className="field">
      <label className="docx-drop" htmlFor={id}>
        <span className="docx-drop__icon" aria-hidden="true">
          ⇪
        </span>
        <span className="docx-drop__title">
          {hasContent ? '上傳新版 Word 檔（會取代目前的內文）' : '選擇 Word 檔（.docx）'}
        </span>
        <span className="docx-drop__hint">
          第一個「標題 1」會變成文章標題，「標題 2／標題 3」會變成小標。粗體、連結、清單、表格和圖片都會保留。
        </span>
        <input
          id={id}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={onChange}
          disabled={busy}
          className="upload-input"
        />
      </label>
      <p className="form-status" role="status">
        {status}
      </p>
      {warnings.length > 0 && (
        <ul className="docx-warnings">
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
