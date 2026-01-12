import { z } from 'zod';

export const QuoteSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1).max(500),
  author: z.string().min(1).max(100),
  source: z.string().url().optional(),
  tags: z.array(z.string().min(1).max(30)).default([]),
  metadata: z
    .object({
      addedAt: z.string().datetime(),
      updatedAt: z.string().datetime().optional(),
      contributor: z.string().optional(),
      verified: z.boolean().default(false),
    })
    .optional(),
});

export type Quote = z.infer<typeof QuoteSchema>;

// Lightweight version for bundle size (no metadata)
export const QuoteLiteSchema = QuoteSchema.pick({
  id: true,
  text: true,
  author: true,
  tags: true,
});

export type QuoteLite = z.infer<typeof QuoteLiteSchema>;

export const QuoteStatsSchema = z.object({
  totalQuotes: z.number(),
  totalAuthors: z.number(),
  totalTags: z.number(),
  avgQuoteLength: z.number(),
  topAuthors: z.array(z.object({ author: z.string(), count: z.number() })),
  topTags: z.array(z.object({ tag: z.string(), count: z.number() })),
});

export type QuoteStats = z.infer<typeof QuoteStatsSchema>;

export interface SearchOptions {
  fuzzy?: number;
  prefix?: boolean;
  boost?: {
    author?: number;
    tags?: number;
  };
}
