import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const DOCS_DIR = path.join(process.cwd(), '../../docs');

export interface Doc {
  slug: string[];
  title: string;
  content: string;
  frontmatter: Record<string, unknown>;
}

export interface DocItem {
  title: string;
  href: string;
  children?: DocItem[];
}

function getFilesRecursively(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath));
    } else {
      if (file.endsWith('.md') && !file.startsWith('_')) {
        results.push(filePath);
      }
    }
  }
  return results;
}

export function getAllDocsTree(): DocItem[] {
  // Hardcoded structure for better control over sidebar order vs file system order
  // In a real app we might parse this from a config or walk FS smartly
  return [
    {
      title: 'Introduction',
      href: '/docs',
      children: [
        { title: 'Overview', href: '/docs' },
      ],
    },
    {
      title: 'Guides',
      href: '/docs/guides',
      children: [
        { title: 'Installation', href: '/docs/guides/installation' },
        // Add dynamic discovery if needed, but manual is safer for now
      ]
    },
    {
      title: 'Architecture',
      href: '/docs/architecture',
      children: [
        { title: 'Overview', href: '/docs/architecture/overview' },
      ]
    },
    {
      title: 'API Reference',
      href: '/docs/reference',
      children: [
        { title: 'HTTP API', href: '/docs/reference/http-api' },
      ]
    }
  ];
}

export async function getDocBySlug(slug: string[]): Promise<Doc | null> {
  // Handle root /docs -> index.md
  const isRoot = slug.length === 0;
  
  let relativePath = slug.join('/');
  if (isRoot) relativePath = 'index';
  
  // Try exact match first (e.g. guides/installation.md)
  let fullPath = path.join(DOCS_DIR, `${relativePath}.md`);
  
  if (!fs.existsSync(fullPath)) {
    // Try directory index (e.g. architecture/index.md)
    fullPath = path.join(DOCS_DIR, relativePath, 'index.md');
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  
  // Try to find title from frontmatter or first h1
  let title = data.title as string;
  if (!title) {
    const h1Match = content.match(/^#\s+(.+)$/m);
    title = h1Match ? h1Match[1] : slug[slug.length - 1];
  }

  return {
    slug,
    title,
    content,
    frontmatter: data,
  };
}
