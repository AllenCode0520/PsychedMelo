import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="lost">
      <div className="lost__panel panel panel--rivets">
        <p className="hud-label">警告 · Signal lost</p>
        <span className="readout lost__code">404</span>
        <h1>訊號遺失</h1>
        <p>這個座標沒有任何東西，可能已經漂走了。</p>
        <Link href="/" className="btn btn--primary">
          返回主控台
        </Link>
      </div>
    </main>
  );
}
