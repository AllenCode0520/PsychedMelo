import { SettingsForm } from '@/components/admin/SettingsForm';
import { getSettings } from '@/lib/data';

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <>
      <div className="admin-head">
        <div>
          <p className="hud-label">系統 · Settings</p>
          <h1>網站設定</h1>
        </div>
      </div>
      <SettingsForm settings={settings} />
    </>
  );
}
