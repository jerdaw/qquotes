import { describe, expect, test } from 'bun:test';
import quotes from '../../../data/src/quotes.json';
import { QuoteSchema } from '../schema';

describe('Quote Data Integrity', () => {
  test('all quotes conform to Zod schema', () => {
    for (const quote of quotes) {
      const result = QuoteSchema.safeParse(quote);
      if (!result.success) {
        console.error(`Invalid quote at ID ${quote.id}:`, result.error.format());
      }
      expect(result.success).toBe(true);
    }
  });

  test('all quote IDs are unique', () => {
    const ids = quotes.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('no quotes exceed 500 characters', () => {
    const longQuotes = quotes.filter((q) => q.text.length > 500);
    expect(longQuotes).toEqual([]);
  });

  test('all tags are lowercase and trimmed', () => {
    for (const quote of quotes) {
      for (const tag of quote.tags) {
        expect(tag).toBe(tag.toLowerCase().trim());
      }
    }
  });
});
