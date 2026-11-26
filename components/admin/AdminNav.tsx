'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: '總覽' },
  { href: '/admin/tracks', label: '音軌' },
  { href: '/admin/articles', label: '文章' },
  { href: '/admin/media', label: '媒體庫' },
  { href: '/admin/settings', label: '網站設定' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="後台選單" className="admin-nav">
      <ul>
        {LINKS.map((link) => {
          const active =
            link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link href={link.href} aria-current={active ? 'page' : undefined}>
                <span className={`led${active ? ' is-on' : ''}`} aria-hidden="true" />
                {link.label}
              </Link>
            </li>
          );
        })}
        <li>
          <Link href="/">查看網站 ↗</Link>
        </li>
      </ul>
    </nav>
  );
}
