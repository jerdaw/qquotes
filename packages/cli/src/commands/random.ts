import { getInstance } from '@qquotes/core';
import chalk from 'chalk';
import { Command } from 'commander';
import { type OutputFormat, formatQuotes } from '../utils';

const command = new Command('random')
  .description('Get random quote(s)')
  .option('-n, --count <number>', 'Number of quotes to return', '1')
  .option('-m, --mode <mode>', 'Quote mode (all, system, personal, mixed)', 'all')
  .option('-t, --tag <tag>', 'Filter by tag')
  .option('-a, --author <author>', 'Filter by author')
  .option('-f, --format <format>', 'Output format (text, json, markdown)', 'text')
  .action((options) => {
    const q = getInstance();
    const count = Number.parseInt(options.count);
    // biome-ignore lint/suspicious/noExplicitAny: Temporary loose typing
    let results: any;

    if (options.tag) {
      results = q.byTag(options.tag);
    } else if (options.author) {
      results = q.byAuthor(options.author);
    } else {
      // Use core random with mode support if no filters
      // Note: q.random returns single item if count is 1, array if > 1 or forced.
      // But here we want strictly array for consistency for formatQuotes
      const quotes = q.random(count, options.mode);
      results = Array.isArray(quotes) ? quotes : [quotes];
      // Skip manual shuffle since q.random handles it
      console.log(formatQuotes(results, options.format as OutputFormat));
      return;
    }

    if (results.length === 0) {
      console.log(chalk.red('No quotes found.'));
      return;
    }

    const shuffled = [...results].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    console.log(formatQuotes(selected, options.format as OutputFormat));
  });

export default command;
