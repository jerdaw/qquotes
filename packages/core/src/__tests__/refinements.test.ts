
import { describe, test, expect } from 'bun:test';
import { QQuotes } from '../store';
import { Quote } from '../schema';

describe('QQuotes Core Refinements', () => {
  test('changing author removes quote from old author index', () => {
    const quote: Quote = {
      id: '00000000-0000-4000-a000-000000000001',
      text: 'Hello',
      author: 'Alice',
      tags: ['a'],
      metadata: { addedAt: new Date().toISOString(), verified: true }
    };

    const store = new QQuotes({ quotes: [quote] });
    
    expect(store.byAuthor('Alice')).toHaveLength(1);
    expect(store.byAuthor('Bob')).toHaveLength(0);

    const updatedQuote: Quote = {
      ...quote,
      author: 'Bob'
    };

    store.addPersonalQuote(updatedQuote);

    expect(store.byAuthor('Bob')).toHaveLength(1);
    expect(store.byAuthor('Alice')).toHaveLength(0); // Should be 0 now!
  });

  test('changing tags updates tag index correctly', () => {
     const quote: Quote = {
      id: '00000000-0000-4000-a000-000000000002',
      text: 'Tag Test',
      author: 'Charlie',
      tags: ['tag1'],
      metadata: { addedAt: new Date().toISOString(), verified: true }
    };

    const store = new QQuotes({ quotes: [quote] });
    expect(store.byTag('tag1')).toHaveLength(1);
    expect(store.byTag('tag2')).toHaveLength(0);

    const updatedQuote = { ...quote, tags: ['tag2'] };
    store.addPersonalQuote(updatedQuote);

    expect(store.byTag('tag2')).toHaveLength(1);
    expect(store.byTag('tag1')).toHaveLength(0);
  });

  test('stats reflect correct counts with Sets', () => {
    const store = new QQuotes({
        quotes: [
            { id: '1', text: 'T1', author: 'A1', tags: ['T1'], metadata: { addedAt: new Date().toISOString() } },
            { id: '2', text: 'T2', author: 'A1', tags: ['T2'], metadata: { addedAt: new Date().toISOString() } }
        ] as any
    });

    const stats = store.stats();
    expect(stats.totalAuthors).toBe(1);
    expect(stats.totalQuotes).toBe(2);
    expect(stats.topAuthors[0].count).toBe(2);
  });
});
