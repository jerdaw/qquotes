import type { Quote, QuoteStats, SearchOptions } from './schema';
import { QuoteSearchEngine } from './search';
import type { QQuotesOptions } from './types';

export class QQuotes {
  private quotes: Quote[];
  private idMap: Map<string, Quote>;
  private authorMap: Map<string, string[]>;
  private tagMap: Map<string, string[]>;
  private searchEngine: QuoteSearchEngine;
  private _stats?: QuoteStats | undefined;

  constructor(options: QQuotesOptions = {}) {
    this.quotes = options.quotes || [];
    this.idMap = new Map(this.quotes.map((q) => [q.id, q]));

    // Initialize indexes
    this.authorMap = new Map();
    this.tagMap = new Map();

    if (options.indexes?.byAuthor) {
      for (const [author, ids] of Object.entries(options.indexes.byAuthor)) {
        this.authorMap.set(author.toLowerCase(), ids);
      }
    } else {
      for (const quote of this.quotes) {
        const authorKey = quote.author.toLowerCase();
        const ids = this.authorMap.get(authorKey) || [];
        ids.push(quote.id);
        this.authorMap.set(authorKey, ids);
      }
    }

    if (options.indexes?.byTag) {
      for (const [tag, ids] of Object.entries(options.indexes.byTag)) {
        this.tagMap.set(tag, ids);
      }
    } else {
      for (const quote of this.quotes) {
        for (const tag of quote.tags) {
          const ids = this.tagMap.get(tag) || [];
          ids.push(quote.id);
          this.tagMap.set(tag, ids);
        }
      }
    }

    if (options.indexes?.searchIndex) {
      const indexJson =
        typeof options.indexes.searchIndex === 'string'
          ? options.indexes.searchIndex
          : JSON.stringify(options.indexes.searchIndex);
      this.searchEngine = QuoteSearchEngine.fromJSON(indexJson, this.quotes);
    } else {
      this.searchEngine = new QuoteSearchEngine(this.quotes);
    }

    this._stats = options.stats;
  }

  random(): Quote;
  random(count: number): Quote[];
  random(count?: number): Quote | Quote[] {
    if (this.quotes.length === 0) throw new Error('No quotes available');

    if (count === undefined) {
      const index = Math.floor(Math.random() * this.quotes.length);
      const quote = this.quotes[index];
      if (!quote) throw new Error('Failed to retrieve random quote');
      return quote;
    }

    const shuffled = [...this.quotes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, this.quotes.length));
  }

  get(id: string): Quote | undefined {
    return this.idMap.get(id);
  }

  all(): Quote[] {
    return this.quotes;
  }

  byAuthor(author: string): Quote[] {
    const authorKey = author.toLowerCase();
    const ids = this.authorMap.get(authorKey) || [];
    return ids.map((id) => this.idMap.get(id)).filter((q): q is Quote => !!q);
  }

  byTag(tag: string): Quote[] {
    const ids = this.tagMap.get(tag) || [];
    return ids.map((id) => this.idMap.get(id)).filter((q): q is Quote => !!q);
  }

  byTags(tags: string[], mode: 'all' | 'any' = 'any'): Quote[] {
    if (mode === 'any') {
      const ids = new Set(tags.flatMap((t) => this.tagMap.get(t) || []));
      return Array.from(ids)
        .map((id) => this.idMap.get(id))
        .filter((q): q is Quote => !!q);
    }
    const idArrays = tags.map((t) => this.tagMap.get(t) || []);
    if (idArrays.length === 0) return [];
    const commonIds = idArrays.reduce((a, b) => a.filter((c) => b.includes(c)));
    return commonIds.map((id) => this.idMap.get(id)).filter((q): q is Quote => !!q);
  }

  search(query: string, options?: SearchOptions): Quote[] {
    return this.searchEngine.search(query, options);
  }

  authors(): string[] {
    return Array.from(this.authorMap.keys()).sort();
  }

  tags(): string[] {
    return Array.from(this.tagMap.keys()).sort();
  }

  stats(): QuoteStats {
    if (this._stats) return this._stats;

    const authors = this.authors();
    const tags = this.tags();

    return {
      totalQuotes: this.quotes.length,
      totalAuthors: authors.length,
      totalTags: tags.length,
      avgQuoteLength:
        this.quotes.reduce((acc, q) => acc + q.text.length, 0) / (this.quotes.length || 1),
      topAuthors: Array.from(this.authorMap.entries())
        .map(([author, ids]) => ({ author, count: ids.length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topTags: Array.from(this.tagMap.entries())
        .map(([tag, ids]) => ({ tag, count: ids.length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };
  }

  count(): number {
    return this.quotes.length;
  }
}
