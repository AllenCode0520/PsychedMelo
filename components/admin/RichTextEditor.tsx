'use client';

import { useId, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { uploadFile } from '@/lib/upload-client';

type Props = {
  name: string;
  label: string;
  initialHtml?: string;
  hint?: string;
};

export function RichTextEditor({ name, label, initialHtml = '', hint }: Props) {
  const labelId = useId();
  const [html, setHtml] = useState(initialHtml);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        // 預設會加 nofollow 與開新分頁；站內連結對 SEO 比較好的做法是都不要。
        HTMLAttributes: { rel: 'noopener noreferrer', target: null },
      }),
      ImageExtension,
    ],
    content: initialHtml,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'rte__content prose',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-labelledby': labelId,
      },
    },
    onUpdate: ({ editor: current }) => setHtml(current.getHTML()),
  });

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const input = window.prompt('連結網址（留空會移除連結）', previous ?? 'https://');
    if (input === null) return;
    const href = input.trim();
    const chain = editor.chain().focus().extendMarkRange('link');
    if (!href) chain.unsetLink().run();
    else chain.setLink({ href }).run();
  }

  async function onImageChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file || !editor) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadFile(file, 'image');
      const alt =
        window.prompt('圖片替代文字：描述圖片內容，給搜尋引擎和視障讀者看', '') ?? '';
      editor.chain().focus().setImage({ src: url, alt }).run();
    } catch (err) {
      setError(err instanceof Error ? err.message : '圖片上傳失敗。');
    } finally {
      setUploading(false);
      input.value = '';
    }
  }

  const tools: { label: string; content: ReactNode; run: () => void; active?: boolean }[] = editor
    ? [
        { label: '內文', content: '¶', run: () => editor.chain().focus().setParagraph().run(), active: editor.isActive('paragraph') },
        { label: '大標題', content: 'H2', run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
        { label: '小標題', content: 'H3', run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
        { label: '粗體', content: <strong>B</strong>, run: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
        { label: '斜體', content: <em>I</em>, run: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
        { label: '刪除線', content: <s>S</s>, run: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
        { label: '項目清單', content: '•≡', run: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
        { label: '編號清單', content: '1.', run: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
        { label: '引言', content: '❝', run: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
        { label: '分隔線', content: '—', run: () => editor.chain().focus().setHorizontalRule().run() },
        { label: '連結', content: '連結', run: setLink, active: editor.isActive('link') },
        { label: '插入圖片', content: uploading ? '上傳中' : '圖片', run: () => imageInputRef.current?.click() },
        { label: '復原', content: '↶', run: () => editor.chain().focus().undo().run() },
        { label: '重做', content: '↷', run: () => editor.chain().focus().redo().run() },
      ]
    : [];

  return (
    <div className="field">
      <span className="field__label" id={labelId}>
        {label}
      </span>
      <div className="rte">
        <div className="rte__toolbar" role="toolbar" aria-label="文字格式">
          {tools.map((tool) => (
            <button
              key={tool.label}
              type="button"
              className={`rte__btn${tool.active ? ' is-active' : ''}`}
              onClick={tool.run}
              aria-label={tool.label}
              aria-pressed={tool.active === undefined ? undefined : tool.active}
              title={tool.label}
              disabled={uploading && tool.label === '插入圖片'}
            >
              {tool.content}
            </button>
          ))}
        </div>
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name={name} value={html} />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onImageChange}
        aria-hidden="true"
        tabIndex={-1}
      />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {hint && <p className="field__hint">{hint}</p>}
    </div>
  );
}
