import Link from 'next/link';
import { RingMark } from './Icons';
import { MainNav } from './MainNav';

export function SiteHeader({ siteName }: { siteName: string }) {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link href="/" className="brand" aria-label={`${siteName} 首頁`}>
          <span className="brand__mark">
            <RingMark />
          </span>
          <span className="brand__name">{siteName}</span>
        </Link>
        <MainNav />
        <p className="crew-badge">
          <span className="led led--teal is-on" aria-hidden="true" />
          <span className="hud-label">乘客</span>
          <span>訪客</span>
        </p>
      </div>
    </header>
  );
}
