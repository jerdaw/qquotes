import { QuoteSchema } from '../../core/src/schema';
import { QuoteSearchEngine } from '../../core/src/search';
import quotes from '../src/quotes.json';

const validatedQuotes = quotes.map((q) => QuoteSchema.parse(q));

// 1. Minified quotes
await Bun.write('generated/quotes.min.json', JSON.stringify(validatedQuotes));

// 2. Author Index
const byAuthor = validatedQuotes.reduce(
  (acc, q) => {
    const authorKey = q.author.toLowerCase();
    const ids = acc[authorKey] || [];
    ids.push(q.id);
    acc[authorKey] = ids;
    return acc;
  },
  {} as Record<string, string[]>,
);
await Bun.write('generated/index.by-author.json', JSON.stringify(byAuthor));

// 3. Tag Index
const byTag = validatedQuotes.reduce(
  (acc, q) => {
    for (const tag of q.tags) {
      const ids = acc[tag] || [];
      ids.push(q.id);
      acc[tag] = ids;
    }
    return acc;
  },
  {} as Record<string, string[]>,
);
await Bun.write('generated/index.by-tag.json', JSON.stringify(byTag));

// 4. Search Index
const searchEngine = new QuoteSearchEngine(validatedQuotes);
await Bun.write('generated/search-index.json', searchEngine.toJSON());

// 5. Stats
const stats = {
  totalQuotes: validatedQuotes.length,
  totalAuthors: Object.keys(byAuthor).length,
  totalTags: Object.keys(byTag).length,
  avgQuoteLength:
    validatedQuotes.reduce((acc, q) => acc + q.text.length, 0) / validatedQuotes.length,
  topAuthors: Object.entries(byAuthor)
    .map(([author, ids]) => ({ author, count: ids.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10),
  topTags: Object.entries(byTag)
    .map(([tag, ids]) => ({ tag, count: ids.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10),
};
await Bun.write('generated/stats.json', JSON.stringify(stats));

console.log('✅ Indexes built successfully');
