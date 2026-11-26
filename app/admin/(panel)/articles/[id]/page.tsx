import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deleteArticle } from '@/app/admin/actions';
import { ArticleForm } from '@/components/admin/ArticleForm';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { createClient } from '@/lib/supabase/server';
import type { Article } from '@/lib/types';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('articles').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();
  const article = data as Article;

  return (
    <>
      <div className="admin-head">
        <div>
          <Link href="/admin/articles" className="admin-back">
            ← 文章
          </Link>
          <h1>編輯：{article.title}</h1>
        </div>
        <DeleteButton
          action={deleteArticle}
          id={article.id}
          confirmText={`確定要刪除「${article.title}」嗎？文章頁會消失，這個動作無法復原。`}
        />
      </div>
      <ArticleForm article={article} />
    </>
  );
}
