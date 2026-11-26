import type { SiteSettings } from '@/lib/types';

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <p>
          © {year} {settings.site_name}
          {settings.tagline ? ` · ${settings.tagline}` : ''}
        </p>
        <ul aria-label="其他連結">
          {settings.social_links.map((link) => (
            <li key={link.url}>
              <a href={link.url} rel="noopener noreferrer me" target="_blank">
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a href="/feed.xml">RSS</a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
