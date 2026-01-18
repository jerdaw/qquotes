export function Footer() {
  return (
    <footer className="py-12 border-t border-white/5 bg-black/20 mt-auto">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-sm text-muted-foreground text-center md:text-left">
          <p>© {new Date().getFullYear()} QQuotes. All rights reserved.</p>
          <p className="mt-1">Released under the MIT License.</p>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="https://github.com/dwyl/quotes" className="hover:text-foreground transition-colors">GitHub</a>
          <a href="/docs" className="hover:text-foreground transition-colors">Documentation</a>
          <a href="https://npmjs.com" className="hover:text-foreground transition-colors">NPM</a>
        </div>
      </div>
    </footer>
  );
}
