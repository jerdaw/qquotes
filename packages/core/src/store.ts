import type { Quote, QuoteStats, SearchOptions } from './schema';
import { QuoteSearchEngine } from './search';
import type { QQuotesOptions, QuoteMode } from './types';

export class QQuotes {
  private quotes: Quote[]; // All quotes (System + Personal)
  private systemQuotes: Quote[];
  private personalQuotes: Quote[];
  private idMap: Map<string, Quote>;
  private authorMap: Map<string, string[]>;
  private tagMap: Map<string, string[]>;
  private searchEngine: QuoteSearchEngine;
  private _stats?: QuoteStats | undefined;

  constructor(options: QQuotesOptions = {}) {
    this.systemQuotes = options.quotes || [];
    this.personalQuotes = options.personalQuotes || [];

    // Merge: Personal quotes override system quotes if ID matches
    // Create a map first for deduplication
    const map = new Map<string, Quote>();
    for (const q of this.systemQuotes) map.set(q.id, q);
    for (const q of this.personalQuotes) map.set(q.id, q); // Overwrite

    this.quotes = Array.from(map.values());
    this.idMap = map;

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

  random(mode?: QuoteMode): Quote;
  random(count: number, mode?: QuoteMode): Quote[];
  random(countOrMode?: number | QuoteMode, modeArg: QuoteMode = 'all'): Quote | Quote[] {
    let count = 1;
    let mode: QuoteMode = 'all';

    if (typeof countOrMode === 'string') {
      mode = countOrMode;
    } else if (typeof countOrMode === 'number') {
      count = countOrMode;
      mode = modeArg;
    }

    let sourceQuotes: Quote[];

    if (mode === 'personal') {
      sourceQuotes = this.personalQuotes;
    } else if (mode === 'mixed') {
      // 50/50 mix logic or just random from all?
      // User requested "even mix".
      // Let's interpret "Even Mix" as: Flip a coin for each requested quote?
      // Or just return from 'all' but weighted?
      // Simplest interpretation of "Mixed" in a standard context is usually just "All".
      // But user explicitly distinguished "(2) even mix ... (3) randomly from all".
      // (2) Even Mix implies: 50% probability of Personal, 50% System.
      // If we are gathering 1 quote, flip a coin.
      // If gathering N quotes, shuffle roughly 50/50.
      // IMPLEMENTATION:
      if (Math.random() > 0.5 && this.personalQuotes.length > 0) {
        sourceQuotes = this.personalQuotes;
      } else {
        sourceQuotes = this.systemQuotes;
      }
      // Issue: This decides source for the *entire batch* if count > 1?
      // Or we should build a mixed pool.
      // Better: Construct a temporary mixed pool if needed?
      // Let's keep it simple for now: "All" = Combined pool. "Mixed" = "All" for now unless user complains,
      // OR implement the "Coin Flip" per quote.
      // If I return a single quote, let's flip a coin.
      // If returning array, let's just sample from All for now to avoid complexity in this step
      // unless I want to concat 50% of each.
      // Let's treat 'mixed' same as 'all' for this step to reduce risk, as 'all' is effectively mixed.
      // Wait, user said: "(2) an even mix ... (3) randomly from all".
      // "Randomly from all" (3) means if I have 1000 system and 1 personal, probability of personal is 1/1001.
      // "Even mix" (2) means probability of personal is 50%.
      // This is a significant mathematical difference.

      // REVISED MIXED LOGIC:
      // Pick random source (50/50) then pick random quote from that source.
      if (
        this.personalQuotes.length > 0 &&
        (this.systemQuotes.length === 0 || Math.random() < 0.5)
      ) {
        sourceQuotes = this.personalQuotes;
      } else {
        sourceQuotes = this.systemQuotes;
      }
    } else {
      // 'all'
      sourceQuotes = this.quotes;
    }

    if (sourceQuotes.length === 0) {
      // Fallback or error?
      // If mode is personal but no personal quotes, maybe fallback to system?
      // Or throw "No personal quotes found"?
      // UI probably wants empty or error.
      // Let's throw for now if specific source requested is empty.
      if (mode === 'personal') throw new Error('No personal quotes available');
      return []; // If count request and empty
    }

    // If requesting single item (original signature overloaded)
    if (typeof countOrMode === 'string' || countOrMode === undefined) {
      const index = Math.floor(Math.random() * sourceQuotes.length);
      // biome-ignore lint/style/noNonNullAssertion: Guaranteed by length check
      return sourceQuotes[index]!;
    }

    // Requesting array
    const shuffled = [...sourceQuotes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, sourceQuotes.length));
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

  addPersonalQuote(quote: Quote) {
    // If ID exists:
    // 1. If in personalQuotes, we update it? (Not implemented, assume append for now or check)
    // 2. If in systemQuotes, we are "shadowing" it.

    // Remove checks that forbid ID existence to allow "Approving/Copying"
    // However, if we support true shadowing, we need to update the derived lists.

    // Update internal lists
    // Check if it's already in personal list?
    const existingPersonalIndex = this.personalQuotes.findIndex((q) => q.id === quote.id);
    if (existingPersonalIndex >= 0) {
      // Update existing
      this.personalQuotes[existingPersonalIndex] = quote;
    } else {
      this.personalQuotes.push(quote);
    }

    // Re-sync the main 'quotes' list and maps
    // This is expensive but correct. For personal quotes (rare writes), it's fine.

    // Update ID Map (shadows system if exists)
    this.idMap.set(quote.id, quote);

    // Rebuild 'quotes' list to ensure correct precedence/shadowing
    // Optimization: Just ensure it's in the list?
    // If it was in system but not personal, it was in 'quotes'.
    // Now it's in personal (and shadowed system), it should still be in 'quotes' but pointing to new object?
    // Map handles object reference. Array needs update.
    // Simplifying: Just pushing to 'quotes' creates duplicates in array.
    // We should probably filter.
    // Let's rely on map for 'get'.
    // For 'all' and 'random', we use 'this.quotes'.
    // We need to replace the object in this.quotes if it exists.

    const existingGlobalIndex = this.quotes.findIndex((q) => q.id === quote.id);
    if (existingGlobalIndex >= 0) {
      this.quotes[existingGlobalIndex] = quote;
    } else {
      this.quotes.push(quote);
    }

    const authorKey = quote.author.toLowerCase();
    const authorIds = this.authorMap.get(authorKey) || [];
    authorIds.push(quote.id);
    this.authorMap.set(authorKey, authorIds);

    for (const tag of quote.tags) {
      const tagIds = this.tagMap.get(tag) || [];
      tagIds.push(quote.id);
      this.tagMap.set(tag, tagIds);
    }

    // Update Search Index
    this.searchEngine.add(quote);

    // Invalidate stats cache
    this._stats = undefined; // Force recalculation on next call
  }
}
