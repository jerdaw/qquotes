import { QuoteSchema } from '../../core/src/schema';
import quotes from '../src/quotes.json';

try {
  for (const quote of quotes) {
    QuoteSchema.parse(quote);
  }

  // Check for duplicate IDs
  const ids = quotes.map((q) => q.id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    throw new Error('Duplicate quote IDs found');
  }

  console.log(`✅ ${quotes.length} quotes validated successfully`);
} catch (error) {
  console.error('❌ Validation failed:', error);
  process.exit(1);
}
