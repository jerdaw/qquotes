import { getInstance } from '@qquotes/core';
import chalk from 'chalk';
import { Command } from 'commander';
import { type OutputFormat, formatQuotes } from '../utils';

const command = new Command('search')
  .description('Search quotes')
  .argument('<query>', 'Search query')
  .option('-f, --format <format>', 'Output format (text, json, markdown)', 'text')
  .action((query, options) => {
    const q = getInstance();
    const results = q.search(query);

    if (results.length === 0) {
      console.log(chalk.red('No matching quotes found.'));
      return;
    }

    console.log(formatQuotes(results, options.format as OutputFormat));
  });

export default command;
