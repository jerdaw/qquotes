import { Zap, ShieldCheck, Box, RefreshCw, Search, Database } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized via MiniSearch for sub-millisecond retrieval times.'
  },
  {
    icon: ShieldCheck,
    title: 'Type Safe',
    description: 'Written in TypeScript with 100% strict mode and Zod validation.'
  },
  {
    icon: Box,
    title: 'Zero Bloat',
    description: 'Core logic is separated from data to keep your bundles small.'
  },
  {
    icon: Database,
    title: 'Rich Dataset',
    description: 'Curated collection of wisdom with authors and tags.'
  },
  {
    icon: Search,
    title: 'Fuzzy Search',
    description: 'Powerful full-text search engine built-in.'
  },
  {
    icon: RefreshCw,
    title: 'Modern API',
    description: 'Designed for the modern web with ESM and Tree Shaking.'
  }
];

export function FeatureGrid() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Why QQuotes?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We rebuilt the classic quotes library from the ground up for the modern JavaScript ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div 
              key={feature.title}
              className="group p-8 rounded-2xl bg-secondary/30 border border-white/5 hover:bg-secondary/50 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
