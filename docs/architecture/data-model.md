# Data Model

## Quote Schema

```typescript
// packages/core/src/schema.ts
import { z } from 'zod';

export const QuoteSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1).max(500),
  author: z.string().min(1).max(100),
  source: z.string().url().optional(),
  tags: z.array(z.string().min(1).max(30)).default([]),
  metadata: z.object({
    addedAt: z.string().datetime(),
    updatedAt: z.string().datetime().optional(),
    contributor: z.string().optional(),
    verified: z.boolean().default(false),
  }).optional(),
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
```

## Index Structures

```typescript
// Generated at build time for O(1) lookups
interface QuoteIndexes {
  byAuthor: Map<string, string[]>;      // author -> quote IDs
  byTag: Map<string, string[]>;          // tag -> quote IDs
  byId: Map<string, Quote>;              // id -> quote (primary lookup)
  authorList: string[];                  // sorted unique authors
  tagList: string[];                     // sorted unique tags

  // Inverted index for full-text search (O(1) -> O(log N) instead of O(N))
  searchIndex: {
    tokens: Map<string, Set<string>>;    // token -> quote IDs containing token
    bigramIndex: Map<string, Set<string>>; // bigrams for fuzzy matching
  };

  stats: {
    totalQuotes: number;
    totalAuthors: number;
    totalTags: number;
    avgQuoteLength: number;
    topAuthors: Array<{ author: string; count: number }>;
    topTags: Array<{ tag: string; count: number }>;
  };
}
```

## Sample Data Entry

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "text": "The best way to predict your future is to create it.",
  "author": "Peter Drucker",
  "source": "https://www.goodreads.com/quotes/784267",
  "tags": ["future", "action", "motivation"],
  "metadata": {
    "addedAt": "2024-01-15T10:30:00Z",
    "verified": true
  }
}
```

## Storage Strategy

### System Quotes
- **Location**: `packages/data/src/quotes.json`
- **Mutability**: Immutable for users. Updated through PRs to the main repository.
- **Indexing**: Pre-indexed at build time for maximum performance.

### Personal Quotes
- **Location**: `packages/data/src/personal.json`
- **Mutability**: Fully mutable via the `POST /personal` API endpoint.
- **Shadowing**: If a quote is added with an ID that exists in the system database, the personal version **shadows** the system version. This allows users to "curate" or "edit" the global database for their own use.
- **Merging**: At runtime, `QuoteStore` merges both sources, ensuring personal quotes take precedence. This deduplicated set is used for `all` mode.
