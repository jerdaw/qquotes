import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getDocBySlug } from '../../lib/docs';

export default async function DocsIndexPage() {
  const doc = await getDocBySlug([]);

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
