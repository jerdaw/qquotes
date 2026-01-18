import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getDocBySlug } from '../../../lib/docs';

// Force dynamic because we are reading FS, though for SSG valid paths we could generate params
export const dynamic = 'force-static';

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const doc = await getDocBySlug(slug || []);

  if (!doc) {
    notFound();
  }

  return (
    <article className="prose prose-invert prose-slate max-w-none prose-headings:scroll-mt-28 prose-a:text-primary hover:prose-a:text-primary/80">
      <h1 className="text-4xl font-bold tracking-tight mb-8">{doc.title}</h1>
      <MDXRemote source={doc.content} />
    </article>
  );
}
