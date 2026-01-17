import { Command } from 'commander';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { QuoteSchema, type Quote } from '@qquotes/core';
import { ConfigManager } from '../config';
import { formatQuote } from '../utils';

// Loose schema to handle partial data from unexpected APIs
const RemoteQuoteSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  text: z.string().optional().or(z.string()), // Accept optional or string
  content: z.string().optional(), // Common alt name
  quote: z.string().optional(),   // Common alt name
  author: z.string().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const fetchCommand = new Command('fetch')
  .description('Fetch a quote from a URL and save it')
  .argument('<url>', 'URL to fetch JSON quote from')
  .action(async (url) => {
    try {
      console.log(chalk.dim(`Fetching from ${url}...`));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url, { signal: controller.signal })
        .catch(err => {
          if (err.name === 'AbortError') throw new Error('Request timed out after 10 seconds');
          throw err;
        })
        .finally(() => clearTimeout(timeoutId));
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      const parsed = RemoteQuoteSchema.parse(json);

      // Normalize to our Quote format
      const text = parsed.text || parsed.content || parsed.quote;
      if (!text) {
        throw new Error('Response did not contain a recognizable quote text field (text, content, quote)');
      }

      const remoteId = parsed.id ? String(parsed.id) : undefined;
      // Simple check if it looks like a UUID, otherwise generate one
      const finalId = (remoteId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(remoteId)) 
        ? remoteId 
        : uuidv4();

      const quote: Quote = {
        id: finalId,
        text: text,
        author: parsed.author || 'Unknown',
        source: parsed.source || url,
        tags: parsed.tags || [],
        metadata: {
          addedAt: new Date().toISOString(),
          verified: false,
          contributor: 'fetched-via-cli',
        }
      };

      // Validate against strict schema before saving
      const validQuote = QuoteSchema.parse(quote);

      // Check for duplicates in personal storage by text to be "pro"
      const currentPersonal = await ConfigManager.loadPersonalQuotes();
      const isDuplicate = currentPersonal.some(q => 
        q.text.trim().toLowerCase() === validQuote.text.trim().toLowerCase()
      );

      if (isDuplicate) {
        console.log(chalk.yellow('\nThis quote is already in your personal collection.'));
        console.log(formatQuote(validQuote));
        return;
      }

      await ConfigManager.savePersonalQuote(validQuote);

      console.log(chalk.green('\nQuote fetched and saved!'));
      console.log(formatQuote(validQuote));

    } catch (error) {
      console.error(chalk.red('\nError fetching quote:'));
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(String(error));
      }
      process.exit(1);
    }
  });

export default fetchCommand;
