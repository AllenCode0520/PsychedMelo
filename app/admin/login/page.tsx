import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/LoginForm';
import { getAdminUser } from '@/lib/auth';
import { supabaseConfigured } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '艦長登入',
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await getAdminUser()) redirect('/admin');
  const configured = supabaseConfigured();

  return (
    <main className="login">
      <div className="login__panel panel panel--rivets">
        <p className="hud-label">艦橋 · Bridge access</p>
        <h1>艦長登入</h1>
        <p className="login__note">訪客不需要登入。這裡只給網站管理員使用。</p>
        {configured ? (
          <LoginForm />
        ) : (
          <p className="form-error" role="alert">
            尚未設定 Supabase。請依 README 建立 .env.local，填好後重新啟動網站。
          </p>
        )}
        <Link href="/" className="login__back">
          ← 回到主控台
        </Link>
      </div>
    </main>
  );
}
