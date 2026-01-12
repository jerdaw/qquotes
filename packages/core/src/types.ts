import type { Quote, QuoteStats } from './schema';

export type QuoteMode = 'all' | 'personal' | 'mixed';

export interface QQuotesOptions {
  quotes?: Quote[];
  personalQuotes?: Quote[];
  indexes?: {
    byAuthor?: Record<string, string[]>;
    byTag?: Record<string, string[]>;
    searchIndex?: string | object;
  };
  stats?: QuoteStats;
}
