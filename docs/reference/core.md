# Core Library API

```typescript
// packages/core/src/index.ts

export class qquotes {
    constructor(options?: qquotesOptions);

    // Basic retrieval
    random(mode?: QuoteMode): Quote;
    random(count: number, mode?: QuoteMode): Quote[];
    get(id: string): Quote | undefined;
    all(): Quote[];

    // Filtered retrieval
    byAuthor(author: string): Quote[];
    byTag(tag: string): Quote[];
    byTags(tags: string[], mode?: "all" | "any"): Quote[];

    // Personalization
    addPersonalQuote(quote: Quote): void;

    // Metadata
    authors(): string[];
    tags(): string[];
    stats(): QuoteStats;
    count(): number;
}

export type QuoteMode = "all" | "personal" | "mixed";

export interface qquotesOptions {
    quotes?: Quote[];
    personalQuotes?: Quote[];
    indexes?: {
        byAuthor?: Record<string, string[]>;
        byTag?: Record<string, string[]>;
        searchIndex?: string | object;
    };
    stats?: QuoteStats;
}

// Functional API (tree-shakeable)
export function random(): Quote;
export function randomByTag(tag: string): Quote | undefined;
export function byAuthor(author: string): Quote[];
export function search(query: string): Quote[];
export function authors(): string[];
export function tags(): string[];
```
