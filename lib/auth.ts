import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabaseConfigured } from './site';
import { createClient } from './supabase/server';

/** 目前登入、而且在 admins 名單裡的使用者；訪客或非管理員回傳 null。 */
export async function getAdminUser(): Promise<User | null> {
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  return data ? user : null;
}

/** 後台頁面與 server actions 開頭呼叫：不是管理員就送回登入頁。 */
export async function requireAdmin(): Promise<User> {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');
  return user;
}
