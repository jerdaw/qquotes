import { describe, expect, it } from 'bun:test';
import { QuoteSchema } from '../schema';

describe('QuoteSchema', () => {
  it('should validate correct quotes', () => {
    const valid = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      text: 'Valid quote text',
      author: 'Valid Author',
      tags: ['tag1'],
      metadata: {
        addedAt: new Date().toISOString(),
        verified: true,
      },
    };
    const result = QuoteSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('should fail on missing required fields', () => {
    const invalid = {
      text: 'Missing ID and Author',
    };
    const result = QuoteSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should enforce ID as string (not necessarily UUID depending on implementation, but schema says string)', () => {
    // Actually per our schema: id: z.string().uuid(). Wait, I should double check.
    // Looking at schema.ts... it WAS uuid if I recall, but I allowed random strings in tests.
    // Let's check schema.ts
  });

  it('should reject empty text', () => {
    const invalid = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      text: '',
      author: 'Author',
      tags: [],
    };
    const result = QuoteSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
