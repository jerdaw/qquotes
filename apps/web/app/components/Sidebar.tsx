import Link from 'next/link';
import { getAllDocsTree, type DocItem } from '../../lib/docs';

export function Sidebar() {
  const tree = getAllDocsTree();

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-white/5 bg-background/50 backdrop-blur-xl h-[calc(100vh-5rem)] sticky top-20 overflow-y-auto py-8 pr-6">
      <nav className="space-y-8">
        {tree.map((section) => (
          <div key={section.title}>
            <h3 className="font-semibold text-foreground mb-3 px-3">{section.title}</h3>
            <ul className="space-y-1">
              {section.children?.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
