import type { Quote, QuoteStats } from './schema';

export interface QQuotesOptions {
  quotes?: Quote[];
  indexes?: {
    byAuthor?: Record<string, string[]>;
    byTag?: Record<string, string[]>;
    searchIndex?: string | object;
  };
  stats?: QuoteStats;
}
