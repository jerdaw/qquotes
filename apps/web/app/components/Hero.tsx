import { QQuotes, type Quote } from '@qquotes/core';
import quotes from '@qquotes/data/quotes';
import Link from 'next/link';
import { ArrowRight, Zap, BadgeCheck } from 'lucide-react';

// Initialize store once (or per request, it's fast)
// In a real app we might cache this instance
const store = new QQuotes({ quotes: quotes as unknown as Quote[] });

export function Hero() {
  const randomQuote = store.random();

  return (
    <div className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-[100px]" />
      </div>

      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-white/5 text-sm font-medium text-primary mb-8 animate-[fade-in_1s_ease-out]">
          <BadgeCheck className="w-4 h-4" />
          <span>v1.0.0 Now Available</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent animate-[slide-up_0.8s_ease-out]">
          The Quotes Library for <br/>
          <span className="text-primary bg-clip-text">Modern Web</span>
        </h1>

        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-[slide-up_1s_ease-out_0.2s_both]">
          Sub-millisecond retrieval, full TypeScript support, and zero runtime dependencies. 
          Built for speed, designed for stability.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-[slide-up_1s_ease-out_0.4s_both]">
          <Link 
            href="/docs" 
            className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a 
            href="https://github.com/dwyl/quotes" 
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-8 py-4 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl font-bold border border-white/5 transition-all hover:scale-105 active:scale-95"
          >
            View on GitHub
          </a>
        </div>

        {/* Live Demo Card */}
        <div className="relative mx-auto max-w-2xl animate-[slide-up_1s_ease-out_0.6s_both]">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-20" />
          <div className="relative bg-secondary/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
            <div className="absolute top-4 right-4 flex gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500/20" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
              <div className="w-3 h-3 rounded-full bg-green-500/20" />
            </div>
            
            <div className="text-left space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-4">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span>Server-Side Rendered • {new Date().toLocaleTimeString()}</span>
              </div>
              
              <blockquote className="text-2xl md:text-3xl font-serif italic text-foreground leading-relaxed">
                "{randomQuote.text}"
              </blockquote>
              
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                <cite className="text-sm font-semibold tracking-wide uppercase text-primary not-italic">
                  — {randomQuote.author}
                </cite>
              </div>

              <div className="mt-6 flex gap-2 flex-wrap">
                {randomQuote.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded-md bg-white/5 text-xs text-muted-foreground border border-white/5">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
            * Actual quote fetched live from @qquotes/core
          </div>
        </div>
      </div>
    </div>
  );
}
