import { SITE_TIMEZONE } from './site';

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** 秒數 → 4:12 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return '--:--';
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${pad2(total % 60)}`;
}

/** 秒數 → PT4M12S（給結構化資料用） */
export function isoDuration(seconds: number | null | undefined): string | undefined {
  if (!seconds || seconds <= 0) return undefined;
  const total = Math.round(seconds);
  return `PT${Math.floor(total / 60)}M${total % 60}S`;
}

const dateFormatter = new Intl.DateTimeFormat('zh-TW', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: SITE_TIMEZONE,
});

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
}

export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

/** 中文大約每分鐘 400 字。 */
export function readingMinutes(plainText: string): number {
  return Math.max(1, Math.round(plainText.length / 400));
}

/** 安全地把物件放進 <script type="application/ld+json">。 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
