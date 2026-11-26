import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/cockpit/SiteFooter';
import { CrtOverlay } from '@/components/cockpit/CrtOverlay';
import { CursorStardust } from '@/components/cockpit/CursorStardust';
import { SiteHeader } from '@/components/cockpit/SiteHeader';
import { PlayerDock } from '@/components/player/PlayerDock';
import { PlayerProvider } from '@/components/player/PlayerProvider';
import { getSettings } from '@/lib/data';

/** 前台共用外框。播放器放在這裡，訪客換頁時音樂不會停。 */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();

  return (
    <PlayerProvider>
      <div className="site">
        <a className="skip-link" href="#main">
          跳到主要內容
        </a>
        <SiteHeader siteName={settings.site_name} />
        <main id="main">{children}</main>
        <SiteFooter settings={settings} />
      </div>
      <PlayerDock />
      <CrtOverlay />
      <CursorStardust />
    </PlayerProvider>
  );
}
