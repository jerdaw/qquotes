import { init } from '@qquotes/core';
import chalk from 'chalk';
import { Command } from 'commander';
import { formatQuote } from './utils';

import listCmd from './commands/list';
import { authorsCommand, statsCommand, tagsCommand } from './commands/meta';
// Import commands
import fetchCmd from './commands/fetch';
import { interactiveCommand } from './commands/interactive';
import randomCmd from './commands/random';
import searchCmd from './commands/search';

import { ConfigManager } from './config';
import byAuthor from '@qquotes/data/index-author' with { type: 'json' };
import byTag from '@qquotes/data/index-tag' with { type: 'json' };
// Import data
import quotes from '@qquotes/data/quotes' with { type: 'json' };
import searchIndex from '@qquotes/data/search-index' with { type: 'json' };
import stats from '@qquotes/data/stats' with { type: 'json' };

const program = new Command();

const personalQuotes = await ConfigManager.loadPersonalQuotes();

const q = init({
  // biome-ignore lint/suspicious/noExplicitAny: JSON import types not inferred
  quotes: quotes as any,
  indexes: {
    // biome-ignore lint/suspicious/noExplicitAny: JSON import types not inferred
    byAuthor: byAuthor as any,
    // biome-ignore lint/suspicious/noExplicitAny: JSON import types not inferred
    byTag: byTag as any,
    // biome-ignore lint/suspicious/noExplicitAny: JSON import types not inferred
    searchIndex: searchIndex as any,
  },
  // biome-ignore lint/suspicious/noExplicitAny: JSON import types not inferred
  stats: stats as any,
  personalQuotes,
});

program
  .name('qquotes')
  .description('A modern, fast, reliable quotes CLI')
  .version('0.1.0')
  .option('--motd', 'Show quote of the day')
  .option('--fortune', 'Show random quote in fortune style')
  .action((options) => {
    if (options.motd) {
      const all = q.all();
      // biome-ignore lint/style/noNonNullAssertion: Date split always returns element
      const day = new Date().toISOString().split('T')[0]!;
      // Simple deterministic hash based on date string
      let hash = 0;
      for (let i = 0; i < day.length; i++) {
        hash = (hash << 5) - hash + day.charCodeAt(i);
        hash |= 0;
      }
      const index = Math.abs(hash) % all.length;
      // biome-ignore lint/style/noNonNullAssertion: Index guaranteed by modulo
      const quote = all[index]!;
      console.log(chalk.yellow('\nQuote of the Day:'));
      console.log(formatQuote(quote));
      return;
    }

    if (options.fortune) {
      const quote = q.random();
      console.log(chalk.magenta('\nYour Fortune:'));
      console.log(formatQuote(quote));
      return;
    }

    // Default: show random quote if no command
    if (program.args.length === 0) {
      const quote = q.random();
      console.log(formatQuote(quote));
    }
  });

program.addCommand(randomCmd);
program.addCommand(interactiveCommand);
program.addCommand(searchCmd);
program.addCommand(fetchCmd);
program.addCommand(listCmd);
program.addCommand(authorsCommand);
program.addCommand(tagsCommand);
program.addCommand(statsCommand);

program.parseAsync(process.argv);
