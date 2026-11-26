import Link from 'next/link';
import { ArticleForm } from '@/components/admin/ArticleForm';

export default function NewArticlePage() {
  return (
    <>
      <div className="admin-head">
        <div>
          <Link href="/admin/articles" className="admin-back">
            ← 文章
          </Link>
          <h1>上傳文章</h1>
        </div>
      </div>
      <ArticleForm />
    </>
  );
}
