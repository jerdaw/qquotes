import { describe, expect, it } from 'bun:test';
import { QuoteSchema } from '@qquotes/core';
import quotes from '../quotes.json' with { type: 'json' };

describe('Data Integrity', () => {
  it('should have a non-empty quotes.json', () => {
    expect(quotes.length).toBeGreaterThan(0);
  });

  it('should all quotes conform to schema', () => {
    for (const q of quotes) {
      const result = QuoteSchema.safeParse(q);
      if (!result.success) {
        console.error(`Invalid quote: ${q.id}`, result.error.format());
      }
      expect(result.success).toBe(true);
    }
  });

  it('should have unique IDs', () => {
    const ids = new Set(quotes.map((q) => q.id));
    expect(ids.size).toBe(quotes.length);
  });
});
