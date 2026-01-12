import { z } from '@hono/zod-openapi';

// Minimalist schemas without .openapi() metadata to rule out evaluation errors
export const QuoteSchema = z.object({
  id: z.string(),
  text: z.string(),
  author: z.string(),
  tags: z.array(z.string()),
  score: z.number().optional(),
});

export const PaginationMetaSchema = z.object({
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export const QuotesResponseSchema = z.object({
  data: z.array(QuoteSchema),
  meta: PaginationMetaSchema,
});

export const AuthorSchema = z.object({
  name: z.string(),
  count: z.number(),
});

export const TagSchema = z.object({
  name: z.string(),
  count: z.number(),
});
