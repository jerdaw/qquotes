# Core Library API

```typescript
// packages/core/src/index.ts

export class QQuotes {
  constructor(options?: QQuotesOptions);

  // Basic retrieval
  random(): Quote;
  random(count: number): Quote[];
  get(id: string): Quote | undefined;
  all(): Quote[];

  // Filtered retrieval
  byAuthor(author: string): Quote[];
  byTag(tag: string): Quote[];
  byTags(tags: string[], mode?: 'all' | 'any'): Quote[];

  // Random with filters
  randomByAuthor(author: string): Quote | undefined;
  randomByTag(tag: string): Quote | undefined;

  // Search
  search(query: string, options?: SearchOptions): Quote[];

  // Metadata
  authors(): string[];
  tags(): string[];
  stats(): QuoteStats;
  count(): number;
}

// Functional API (tree-shakeable)
export function random(): Quote;
export function randomByTag(tag: string): Quote | undefined;
export function byAuthor(author: string): Quote[];
export function search(query: string): Quote[];
export function authors(): string[];
export function tags(): string[];
```
