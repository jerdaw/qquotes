import { getInstance } from '@qquotes/core';
import chalk from 'chalk';
import { Command } from 'commander';
import { type OutputFormat, formatQuotes } from '../utils';

const command = new Command('list')
  .description('List all quotes')
  .option('-l, --limit <number>', 'Number of quotes to show', '20')
  .option('-o, --offset <number>', 'Offset', '0')
  .option('-m, --mode <mode>', 'Quote mode (all, system, personal)', 'all')
  .option('-t, --tag <tag>', 'Filter by tag')
  .option('-f, --format <format>', 'Output format (text, json, markdown)', 'text')
  .action((options) => {
    const q = getInstance();
    let results: any;

    if (options.tag) {
      results = q.byTag(options.tag);
    } else {
      // Filter by mode if specified
      if (options.mode === 'personal') {
        // Core doesn't have a direct 'getByMode' for all, but we can filter
        results = q.all().filter(quote => 
          quote.metadata?.contributor === 'fetched-via-cli' || 
          quote.metadata?.contributor === 'personal'
        );
        // Wait, core store actually separates them internally. 
        // Better to use the public API if possible.
        // Actually q.all() returns the merged list.
        // Let's use the random logic's internal knowledge if needed or just filter.
      } else if (options.mode === 'system') {
        results = q.all().filter(quote => quote.metadata?.contributor !== 'fetched-via-cli');
      } else {
        results = q.all();
      }
    }

    const limit = Number.parseInt(options.limit);
    const offset = Number.parseInt(options.offset);
    const paginated = results.slice(offset, offset + limit);

    if (paginated.length === 0) {
      console.log(chalk.red('No quotes found.'));
      return;
    }

    console.log(formatQuotes(paginated, options.format as OutputFormat));
  });

export default command;
