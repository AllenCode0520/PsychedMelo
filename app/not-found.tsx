import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="lost">
      <div className="lost__panel panel panel--rivets">
        <p className="hud-label">404 · Not found</p>
        <span className="readout lost__code">404</span>
        <h1>迷路了</h1>
        <p>這個頁面不存在，可能已經飄走了。</p>
        <Link href="/" className="btn btn--primary">
          回到首頁
        </Link>
      </div>
    </main>
  );
}
