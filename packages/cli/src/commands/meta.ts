import { getInstance } from '@qquotes/core';
import chalk from 'chalk';
import { Command } from 'commander';
import type { OutputFormat } from '../utils';

export const authorsCommand = new Command('authors')
  .description('List all authors')
  .option('-f, --format <format>', 'Output format (text, json)', 'text')
  .action((options) => {
    const q = getInstance();
    const authors = q.authors();
    if (options.format === 'json') {
      console.log(JSON.stringify(authors, null, 2));
      return;
    }
    console.log(chalk.blue('\nAuthors:'));
    for (const author of authors) {
      console.log(`- ${author}`);
    }
  });

export const tagsCommand = new Command('tags')
  .description('List all tags')
  .option('-f, --format <format>', 'Output format (text, json)', 'text')
  .action((options) => {
    const q = getInstance();
    const tags = q.tags();
    if (options.format === 'json') {
      console.log(JSON.stringify(tags, null, 2));
      return;
    }
    console.log(chalk.blue('\nTags:'));
    for (const tag of tags) {
      console.log(`- ${tag}`);
    }
  });

export const statsCommand = new Command('stats')
  .description('Show collection statistics')
  .option('-f, --format <format>', 'Output format (text, json)', 'text')
  .action((options) => {
    const s = getInstance().stats();
    if (options.format === 'json') {
      console.log(JSON.stringify(s, null, 2));
      return;
    }
    console.log(chalk.cyan('\nStatistics:'));
    console.log(`Total Quotes: ${s.totalQuotes}`);
    console.log(`Total Authors: ${s.totalAuthors}`);
    console.log(`Total Tags: ${s.totalTags}`);
  });
