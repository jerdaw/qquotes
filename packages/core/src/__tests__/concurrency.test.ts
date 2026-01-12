import { describe, expect, it } from 'bun:test';
import type { Quote } from '../schema';
import { QQuotes } from '../store';

describe('QQuotes Concurrency & Consistency', () => {
  it('should handle many simultaneous additions consistently', async () => {
    const store = new QQuotes({ quotes: [] });
    const count = 100;

    // Create 100 quotes
    const quotesToAdd: Quote[] = Array.from({ length: count }, (_, i) => ({
      id: `id-${i}`,
      text: `Text ${i}`,
      author: `Author ${i % 10}`,
      tags: [`tag-${i % 5}`],
      metadata: { addedAt: new Date().toISOString(), verified: true },
    }));

    // Add them "simultaneously" (JS is single-threaded but we test atomic consistency)
    // In a real Worker/Runtime, multiple requests might call this method.
    for (const q of quotesToAdd) {
      store.addPersonalQuote(q);
    }

    expect(store.count()).toBe(count);
    expect(store.all()).toHaveLength(count);

    // Check indexing consistency
    const authorStore = store.authors();
    expect(authorStore).toHaveLength(10); // 0-9

    const tagStore = store.tags();
    expect(tagStore).toHaveLength(5); // 0-4

    // Check search (Note: we use AND combineWith in search engine now)
    const results = store.search('Text 50');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('id-50');
  });

  it('should maintain precedence when shadowing under load', () => {
    const systemQuote: Quote = {
      id: 'dup',
      text: 'System',
      author: 'S',
      tags: [],
      metadata: { addedAt: new Date().toISOString(), verified: true },
    };
    const store = new QQuotes({ quotes: [systemQuote] });

    // Add 10 personal overrides for same ID
    for (let i = 0; i < 10; i++) {
      store.addPersonalQuote({
        ...systemQuote,
        text: `Personal ${i}`,
      });
    }

    expect(store.get('dup')?.text).toBe('Personal 9');
    expect(store.count()).toBe(1);
    expect(store.all()).toHaveLength(1);
  });
});
