import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deleteTrack } from '@/app/admin/actions';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { TrackForm } from '@/components/admin/TrackForm';
import { createClient } from '@/lib/supabase/server';
import type { Track } from '@/lib/types';

export default async function EditTrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('tracks').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();
  const track = data as Track;

  return (
    <>
      <div className="admin-head">
        <div>
          <Link href="/admin/tracks" className="admin-back">
            ← 音軌
          </Link>
          <h1>編輯：{track.title}</h1>
        </div>
        <DeleteButton
          action={deleteTrack}
          id={track.id}
          confirmText={`確定要刪除「${track.title}」嗎？音軌頁會消失，這個動作無法復原。（音檔仍會留在媒體庫）`}
        />
      </div>
      <TrackForm track={track} />
    </>
  );
}
