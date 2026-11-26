'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: '主控台', code: '01' },
  { href: '/music', label: '音軌', code: '02' },
  { href: '/articles', label: '航行日誌', code: '03' },
  { href: '/about', label: '艦長檔案', code: '04' },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="主選單" className="main-nav">
      <ul>
        {LINKS.map((link) => {
          const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link href={link.href} aria-current={active ? 'page' : undefined}>
                <span className="main-nav__code" aria-hidden="true">
                  {link.code}
                </span>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
