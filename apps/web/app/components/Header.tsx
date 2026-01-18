import Link from 'next/link';
import { Github, Quote, Book } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-secondary/50 px-6 py-3 backdrop-blur-xl shadow-xl">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Quote className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight">QQuotes</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/docs/guide" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</Link>
            <Link href="/docs/api" className="text-muted-foreground hover:text-foreground transition-colors">API Reference</Link>
          </nav>

          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/dwyl/quotes" 
              target="_blank" 
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <Link 
              href="/docs" 
              className="hidden md:inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
            >
              <Book className="w-4 h-4" />
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
