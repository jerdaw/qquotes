import MiniSearch from 'minisearch';
import type { Quote, SearchOptions } from './schema';

interface QuoteDoc {
  id: string;
  text: string;
  author: string;
  tags: string;
}

export class QuoteSearchEngine {
  private miniSearch: MiniSearch<QuoteDoc>;

  constructor(quotes: Quote[]) {
    this.miniSearch = new MiniSearch<QuoteDoc>({
      fields: ['text', 'author', 'tags'],
      storeFields: ['id', 'text', 'author', 'tags'],
      searchOptions: {
        boost: { author: 2, tags: 1.5 },
        prefix: true,
        combineWith: 'AND',
      },
    });

    this.miniSearch.addAll(
      quotes.map((q) => ({
        id: q.id,
        text: q.text,
        author: q.author,
        tags: q.tags.join(' '),
      })),
    );
  }

  add(quote: Quote) {
    if (this.miniSearch.has(quote.id)) {
      this.miniSearch.discard(quote.id);
    }
    this.miniSearch.add({
      id: quote.id,
      text: quote.text,
      author: quote.author,
      tags: quote.tags.join(' '),
    });
  }

  discard(id: string): void {
    this.miniSearch.discard(id);
  }

  search(query: string, options?: SearchOptions): (Quote & { score: number })[] {
    const results = this.miniSearch.search(query, {
      ...options,
    });

    return results.map((result) => {
      const doc = result as unknown as QuoteDoc & { id: string; score: number };
      const quote: Quote & { score: number } = {
        id: doc.id,
        text: doc.text,
        author: doc.author,
        tags: doc.tags.split(' '),
        score: doc.score,
      };
      return quote;
    });
  }

  autoSuggest(query: string) {
    return this.miniSearch.autoSuggest(query);
  }

  toJSON() {
    return JSON.stringify(this.miniSearch.toJSON());
  }

  static fromJSON(json: string, quotes: Quote[]) {
    const engine = new QuoteSearchEngine(quotes);
    engine.miniSearch = MiniSearch.loadJSON(json, {
      fields: ['text', 'author', 'tags'],
      storeFields: ['id', 'text', 'author', 'tags'],
    });
    return engine;
  }
}
