import { describe, expect, it } from 'bun:test';
import * as fc from 'fast-check';
import type { Quote } from '../schema';
import { QQuotes } from '../store';

describe('QQuotes Property-based Testing', () => {
  // Arbitrary for Quote
  const quoteArb = fc.record({
    id: fc.uuid(),
    text: fc.lorem({ mode: 'sentences', maxCount: 2 }),
    author: fc.lorem({ mode: 'words', maxCount: 2 }),
    tags: fc.array(fc.string({ minLength: 2, maxLength: 10, alpha: true }), { maxLength: 5 }),
    metadata: fc.record({
      addedAt: fc.constant(new Date().toISOString()),
      verified: fc.boolean(),
    }),
  });

  it('should always return a quote from random() if the store is non-empty', () => {
    fc.assert(
      fc.property(fc.array(quoteArb, { minLength: 1, maxLength: 50 }), (quotes) => {
        // Ensure unique IDs for initialization
        const uniqueQuotes = Array.from(new Map(quotes.map((q) => [q.id, q])).values());
        const store = new QQuotes({ quotes: uniqueQuotes });

        const result = store.random();
        expect(result).toBeDefined();
        expect(uniqueQuotes.map((q) => q.id)).toContain(result.id);
      }),
    );
  });

  it('should maintain consistent count after additions', () => {
    fc.assert(
      fc.property(
        fc.array(quoteArb, { minLength: 1, maxLength: 20 }),
        fc.array(quoteArb, { minLength: 1, maxLength: 20 }),
        (system, personal) => {
          // Dedup by ID
          const sysMap = new Map(system.map((q) => [q.id, q]));
          const persMap = new Map(personal.map((q) => [q.id, q]));

          const store = new QQuotes({
            quotes: Array.from(sysMap.values()),
            personalQuotes: Array.from(persMap.values()),
          });

          // Total count should be size of union of ID sets
          const allIds = new Set([...sysMap.keys(), ...persMap.keys()]);
          expect(store.count()).toBe(allIds.size);
        },
      ),
    );
  });

  it('should always find a quote if searching for its exact text', () => {
    fc.assert(
      fc.property(fc.array(quoteArb, { minLength: 1, maxLength: 10 }), (quotes) => {
        const uniqueQuotes = Array.from(new Map(quotes.map((q) => [q.id, q])).values());
        const store = new QQuotes({ quotes: uniqueQuotes });

        // Pick one to search for
        const target = uniqueQuotes[Math.floor(Math.random() * uniqueQuotes.length)];
        const results = store.search(target.text);

        // Results should contain the target (MiniSearch usually finds exact matches)
        // Note: Full text search might fail on very short or stop words,
        // but for general unicode strings it should work.
        // We use a simple check: results should not be empty.
        expect(results.length).toBeGreaterThan(0);
        expect(results.some((r) => r.id === target.id)).toBe(true);
      }),
    );
  });
});
