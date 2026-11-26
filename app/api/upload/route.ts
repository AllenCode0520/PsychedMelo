import { getAdminUser } from '@/lib/auth';
import { createUploadUrl, publicUrlFor, storageConfigured } from '@/lib/storage';
import { isMediaKind, type MediaKind } from '@/lib/types';

const MB = 1024 * 1024;
const SIZE_LIMITS: Record<MediaKind, number> = {
  audio: 50 * MB,
  image: 25 * MB,
  video: 50 * MB,
};
const KIND_LABELS: Record<MediaKind, string> = {
  audio: '音檔',
  image: '圖片',
  video: '影片',
};

function safeFileName(name: string): string {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|-+$/g, '')
    .toLowerCase();
  return cleaned.slice(-80) || 'file';
}

/** 後台上傳第一步：檢查身分與檔案，回傳直接上傳到 Supabase Storage 的一次性網址。 */
export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return Response.json({ error: '請先以管理員身分登入。' }, { status: 401 });
  }
  if (!storageConfigured()) {
    return Response.json(
      { error: '尚未設定 Supabase，請依 README 填寫環境變數。' },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const kind = body?.kind;
  if (!isMediaKind(kind)) {
    return Response.json({ error: '不支援的檔案類型。' }, { status: 400 });
  }
  const contentType = typeof body?.contentType === 'string' ? body.contentType : '';
  const size = typeof body?.size === 'number' ? body.size : 0;
  const filename = typeof body?.filename === 'string' ? body.filename : 'file';

  if (!contentType.startsWith(`${kind}/`)) {
    return Response.json({ error: `這裡只接受${KIND_LABELS[kind]}。` }, { status: 400 });
  }
  if (size <= 0 || size > SIZE_LIMITS[kind]) {
    return Response.json(
      { error: `檔案太大，${KIND_LABELS[kind]}上限是 ${SIZE_LIMITS[kind] / MB} MB（Supabase 免費方案單檔上限 50 MB）。` },
      { status: 400 },
    );
  }

  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const key = `${kind}/${now.getUTCFullYear()}/${month}/${crypto.randomUUID()}-${safeFileName(filename)}`;
  let uploadUrl: string;
  try {
    uploadUrl = await createUploadUrl(key);
  } catch (error) {
    const reason = error instanceof Error ? error.message : '';
    return Response.json({ error: `無法建立上傳網址：${reason}` }, { status: 500 });
  }

  return Response.json({ uploadUrl, publicUrl: publicUrlFor(key), key });
}
