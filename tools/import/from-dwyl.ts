import { QuoteSchema } from '../../packages/core/src/schema';

async function migrate() {
  const dwylUrl = 'https://raw.githubusercontent.com/dwyl/quotes/master/quotes.json';
  console.log(`Fetching quotes from ${dwylUrl}...`);

  try {
    const response = await fetch(dwylUrl);
    // biome-ignore lint/suspicious/noExplicitAny: External data
    const dwylQuotes = (await response.json()) as any[];
    console.log(`Fetched ${dwylQuotes.length} quotes.`);

    const migrated = dwylQuotes
      .map((q, i) => {
        const quote = {
          id: crypto.randomUUID(),
          text: q.text || '',
          author: q.author || 'Unknown',
          tags: q.tags || [],
          metadata: {
            addedAt: new Date().toISOString(),
            verified: false,
          },
        };

        const result = QuoteSchema.safeParse(quote);
        if (!result.success) {
          console.warn(`Validation failed for quote ${i}:`, result.error.message);
          return null;
        }
        return result.data;
      })
      .filter(Boolean);

    console.log(`Successfully migrated and validated ${migrated.length} quotes.`);

    const outputPath = 'packages/data/src/quotes.migrated.json';
    await Bun.write(outputPath, JSON.stringify(migrated, null, 2));
    console.log(`Saved migrated quotes to ${outputPath}`);
    console.log('NOTE: Rename to quotes.json to use this data.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
