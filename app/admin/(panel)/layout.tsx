import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { signOut } from '@/app/admin/actions';
import { AdminNav } from '@/components/admin/AdminNav';
import { requireAdmin } from '@/lib/auth';

// 後台每次都要即時檢查登入狀態，不能被快取成靜態頁。
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '艦橋管理',
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="admin">
      <aside className="admin__side">
        <div>
          <p className="brand__name">PsychedMelo</p>
          <p className="hud-label">艦橋 · Bridge</p>
        </div>
        <AdminNav />
        <div className="admin__user">
          <span className="hud-label">艦長</span>
          <span>{user.email}</span>
          <form action={signOut}>
            <button type="submit" className="btn btn--small">
              登出
            </button>
          </form>
        </div>
      </aside>
      <main className="admin__main">{children}</main>
    </div>
  );
}
