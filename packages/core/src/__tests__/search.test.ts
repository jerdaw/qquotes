import { describe, expect, it } from 'bun:test';
import type { Quote } from '../schema';
import { QuoteSearchEngine } from '../search';

describe('QuoteSearchEngine', () => {
  const mockQuotes: Quote[] = [
    {
      id: '1',
      text: 'The quick brown fox jumps over the lazy dog',
      author: 'Unknown',
      tags: ['animals', 'action'],
      metadata: { addedAt: new Date().toISOString(), verified: true },
    },
    {
      id: '2',
      text: 'To be or not to be',
      author: 'Shakespeare',
      tags: ['philosophy'],
      metadata: { addedAt: new Date().toISOString(), verified: true },
    },
  ];

  it('should find quotes by text', () => {
    const engine = new QuoteSearchEngine(mockQuotes);
    const results = engine.search('fox');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');
  });

  it('should support fuzzy matching if requested', () => {
    const engine = new QuoteSearchEngine(mockQuotes);
    const results = engine.search('foxx', { fuzzy: 1 });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].text).toContain('fox');
  });

  it('should handle empty queries gracefully', () => {
    const engine = new QuoteSearchEngine(mockQuotes);
    const results = engine.search('');
    expect(results).toHaveLength(0);
  });

  it('should allow adding quotes dynamically', () => {
    const engine = new QuoteSearchEngine(mockQuotes);
    engine.add({
      id: '3',
      text: 'New quote',
      author: 'Author',
      tags: ['new'],
      metadata: { addedAt: new Date().toISOString(), verified: false },
    });
    const results = engine.search('New');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('3');
  });

  it('should correctly discard shadowed quotes', () => {
    const engine = new QuoteSearchEngine(mockQuotes);
    // Overwrite ID 1
    engine.add({
      id: '1',
      text: 'Updated fox',
      author: 'Unknown',
      tags: ['animals'],
      metadata: { addedAt: new Date().toISOString(), verified: true },
    });

    const results = engine.search('fox');
    expect(results).toHaveLength(1);
    expect(results[0].text).toBe('Updated fox');
  });

  it('should handle OOR (Out of Range) gracefully', () => {
    const engine = new QuoteSearchEngine([]);
    expect(engine.search('anything')).toHaveLength(0);
  });
});
