import Link from 'next/link';
import { TrackForm } from '@/components/admin/TrackForm';

export default function NewTrackPage() {
  return (
    <>
      <div className="admin-head">
        <div>
          <Link href="/admin/tracks" className="admin-back">
            ← 音軌
          </Link>
          <h1>上傳音軌</h1>
        </div>
      </div>
      <TrackForm />
    </>
  );
}
