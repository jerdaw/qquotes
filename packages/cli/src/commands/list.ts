import { getInstance } from '@qquotes/core';
import chalk from 'chalk';
import { Command } from 'commander';
import { type OutputFormat, formatQuotes } from '../utils';

const command = new Command('list')
  .description('List all quotes (paginated)')
  .option('-l, --limit <number>', 'Number of quotes to show', '20')
  .option('-o, --offset <number>', 'Offset', '0')
  .option('-t, --tag <tag>', 'Filter by tag')
  .option('-f, --format <format>', 'Output format (text, json, markdown)', 'text')
  .action((options) => {
    const q = getInstance();
    // biome-ignore lint/suspicious/noExplicitAny: Temporary loose typing
    let results: any;

    if (options.tag) {
      results = q.byTag(options.tag);
    } else {
      results = q.all();
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
