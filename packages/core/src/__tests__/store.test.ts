import { beforeAll, describe, expect, test } from 'bun:test';
import { getInstance, init } from '../index';
import type { Quote } from '../schema';

describe('QQuotes Store', () => {
  // biome-ignore lint/suspicious/noExplicitAny: Test context
  let q: any;
  const mockQuotes: Quote[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      text: 'The best way to predict your future is to create it.',
      author: 'Peter Drucker',
      tags: ['future', 'action', 'motivation'],
      metadata: { addedAt: new Date().toISOString(), verified: true },
    },
    {
      id: '3e84386e-b873-41c9-8dcb-0563229b35fd',
      text: "Everything you've ever wanted is on the other side of fear.",
      author: 'George Addair',
      tags: ['fear', 'motivation'],
      metadata: { addedAt: new Date().toISOString(), verified: true },
    },
  ];

  beforeAll(() => {
    q = init({ quotes: mockQuotes });
  });

  test('random() returns a valid quote', () => {
    const quote = q.random();
    expect(quote).toHaveProperty('id');
    expect(mockQuotes.map((mq) => mq.id)).toContain(quote.id);
  });

  test('random(n) returns n unique quotes', () => {
    const result = q.random(2);
    expect(result).toHaveLength(2);
    // biome-ignore lint/suspicious/noExplicitAny: Test check
    expect(new Set(result.map((quote: any) => quote.id)).size).toBe(2);
  });

  test('get(id) returns the correct quote', () => {
    const quote = q.get(mockQuotes[0].id);
    expect(quote?.text).toBe(mockQuotes[0].text);
  });

  test('byAuthor() is case-insensitive', () => {
    const results = q.byAuthor('peter drucker');
    expect(results).toHaveLength(1);
    expect(results[0].author).toBe('Peter Drucker');
  });

  test('byTag() returns filtered quotes', () => {
    const results = q.byTag('fear');
    expect(results).toHaveLength(1);
    expect(results[0].tags).toContain('fear');
  });

  test('search() finds quotes by text', () => {
    const results = q.search('future');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].text).toContain('future');
  });

  test('stats() provides accurate collection data', () => {
    const s = q.stats();
    expect(s.totalQuotes).toBe(2);
    expect(s.totalAuthors).toBe(2);
    expect(s.totalTags).toBe(4);
  });
});
