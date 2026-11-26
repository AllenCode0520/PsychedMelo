'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Home', code: '01' },
  { href: '/music', label: 'Music', code: '02' },
  { href: '/articles', label: 'Journal', code: '03' },
  { href: '/about', label: 'About', code: '04' },
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
