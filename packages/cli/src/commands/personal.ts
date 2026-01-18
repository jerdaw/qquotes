import { init, type Quote, QuoteSchema } from '@qquotes/core';
import chalk from 'chalk';
import { Command } from 'commander';
import { search, confirm, input } from '@inquirer/prompts';
import { ConfigManager } from '../config';
import { formatQuote } from '../utils';
import * as fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import byAuthor from '@qquotes/data/index-author' with { type: 'json' };
import byTag from '@qquotes/data/index-tag' with { type: 'json' };
import quotes from '@qquotes/data/quotes' with { type: 'json' };
import searchIndex from '@qquotes/data/search-index' with { type: 'json' };
import stats from '@qquotes/data/stats' with { type: 'json' };

export const personalCommand = new Command('personal')
  .description('Manage personal quotes collection');

// Helper to initialize qquotes instance
async function getQuotesInstance() {
  const personalQuotes = await ConfigManager.loadPersonalQuotes();
  return init({
    // biome-ignore lint/suspicious/noExplicitAny: JSON type casting
    quotes: quotes as any,
    indexes: {
      // biome-ignore lint/suspicious/noExplicitAny: JSON type casting
      byAuthor: byAuthor as any,
      // biome-ignore lint/suspicious/noExplicitAny: JSON type casting
      byTag: byTag as any,
      // biome-ignore lint/suspicious/noExplicitAny: JSON type casting
      searchIndex: searchIndex as any,
    },
    // biome-ignore lint/suspicious/noExplicitAny: JSON type casting
    stats: stats as any,
    personalQuotes,
  });
}

// Add subcommand
const addCmd = new Command('add')
  .description('Add a new personal quote')
  .requiredOption('-t, --text <text>', 'Quote text')
  .requiredOption('-a, --author <author>', 'Author name')
  .option('-s, --source <url>', 'Source URL')
  .option('--tags <tags...>', 'Tags (space-separated)', [])
  .action(async (options) => {
    const { text, author, source, tags } = options;

    if (text.length > 500) {
      console.error(chalk.red('Text exceeds 500 characters.'));
      process.exit(1);
    }

    const quote: Quote = {
      id: randomUUID(),
      text,
      author,
      source,
      tags: Array.isArray(tags) ? tags : [],
      metadata: {
        addedAt: new Date().toISOString(),
        verified: false,
        contributor: 'cli-add',
      },
    };

    try {
      QuoteSchema.parse(quote); // Validate
      await ConfigManager.savePersonalQuote(quote);
      const q = await getQuotesInstance();
      q.addPersonalQuote(quote);

      console.log(chalk.green('\nQuote added!'));
      console.log(formatQuote(quote));
      console.log(chalk.dim(`ID: ${quote.id}`));
    } catch (error) {
      console.error(chalk.red('Failed to add quote:'), error);
      process.exit(1);
    }
  });

// Delete subcommand
const deleteCmd = new Command('delete')
  .alias('rm')
  .description('Delete a personal quote')
  .argument('[id]', 'Quote ID to delete')
  .option('-f, --force', 'Skip confirmation')
  .action(async (id, options) => {
    try {
      const q = await getQuotesInstance();
      const personalQuotes = await ConfigManager.loadPersonalQuotes();

      if (personalQuotes.length === 0) {
        console.log(chalk.yellow('No personal quotes to delete.'));
        return;
      }

      let quoteToDelete;

      if (!id) {
        const selectedId = await search({
          message: 'Select quote to delete',
          source: async (term) => {
            const filtered = term
              ? personalQuotes.filter(
                  (q) =>
                    q.text.toLowerCase().includes(term.toLowerCase()) ||
                    q.author.toLowerCase().includes(term.toLowerCase()),
                )
              : personalQuotes;
            return filtered.slice(0, 10).map((q) => ({
              name: `${q.text.slice(0, 60)}... — ${q.author}`,
              value: q.id,
            }));
          },
        });
        quoteToDelete = personalQuotes.find((q) => q.id === selectedId);
      } else {
        quoteToDelete = personalQuotes.find((q) => q.id === id);
      }

      if (!quoteToDelete) {
        console.error(chalk.red('Quote not found.'));
        process.exit(1);
      }

      console.log(chalk.dim('\nQuote to delete:'));
      console.log(formatQuote(quoteToDelete));

      if (!options.force) {
        const confirmed = await confirm({
          message: 'Delete this quote?',
          default: false,
        });
        if (!confirmed) {
          console.log(chalk.dim('Cancelled.'));
          return;
        }
      }

      q.deletePersonalQuote(quoteToDelete.id);
      await ConfigManager.deletePersonalQuote(quoteToDelete.id);

      console.log(chalk.green('\nQuote deleted!'));
    } catch (error) {
      console.error(chalk.red('Failed to delete quote:'), error);
      process.exit(1);
    }
  });

// Update subcommand
const updateCmd = new Command('update')
  .alias('edit')
  .description('Update a personal quote')
  .argument('[id]', 'Quote ID (optional)')
  .option('-t, --text <text>', 'New text')
  .option('-a, --author <author>', 'New author')
  .option('--tags <tags...>', 'New tags')
  .action(async (id, options) => {
    try {
      const q = await getQuotesInstance();
      const personalQuotes = await ConfigManager.loadPersonalQuotes();

      if (personalQuotes.length === 0) {
        console.log(chalk.yellow('No quotes to update.'));
        return;
      }

      let quoteToUpdate;
      if (!id) {
        const selectedId = await search({
          message: 'Select quote to update',
          source: async (term) => {
            const filtered = term
              ? personalQuotes.filter((q) =>
                  q.text.toLowerCase().includes(term.toLowerCase()),
                )
              : personalQuotes;
            return filtered.slice(0, 10).map((q) => ({
              name: `${q.text.slice(0, 60)}... — ${q.author}`,
              value: q.id,
            }));
          },
        });
        quoteToUpdate = personalQuotes.find((q) => q.id === selectedId);
      } else {
        quoteToUpdate = personalQuotes.find((q) => q.id === id);
      }

      if (!quoteToUpdate) {
        console.error(chalk.red('Quote not found.'));
        process.exit(1);
      }

      console.log(chalk.dim('\nCurrent:'));
      console.log(formatQuote(quoteToUpdate));

      const updated: Quote = {
        ...quoteToUpdate,
        text: options.text ?? quoteToUpdate.text,
        author: options.author ?? quoteToUpdate.author,
        tags: options.tags ?? quoteToUpdate.tags,
        metadata: {
          addedAt: quoteToUpdate.metadata?.addedAt ?? new Date().toISOString(),
          verified: quoteToUpdate.metadata?.verified ?? false,
          ...(quoteToUpdate.metadata ?? {}),
          updatedAt: new Date().toISOString(),
        },
      };

      QuoteSchema.parse(updated);
      await ConfigManager.savePersonalQuote(updated);
      q.addPersonalQuote(updated);

      console.log(chalk.green('\nQuote updated!'));
      console.log(formatQuote(updated));
    } catch (error) {
      console.error(chalk.red('Failed to update quote:'), error);
      process.exit(1);
    }
  });

// List subcommand
const listCmd = new Command('list')
  .alias('ls')
  .description('List personal quotes')
  .option('--author <author>', 'Filter by author')
  .option('--tag <tag>', 'Filter by tag')
  .action(async (options) => {
    try {
      let personalQuotes = await ConfigManager.loadPersonalQuotes();

      if (personalQuotes.length === 0) {
        console.log(chalk.yellow('No personal quotes yet.'));
        console.log(chalk.dim('\nAdd quotes with:'));
        console.log(chalk.dim('  qquotes personal add -t "Quote" -a "Author"'));
        return;
      }

      if (options.author) {
        personalQuotes = personalQuotes.filter((q) =>
          q.author.toLowerCase().includes(options.author.toLowerCase()),
        );
      }

      if (options.tag) {
        personalQuotes = personalQuotes.filter((q) => q.tags.includes(options.tag));
      }

      if (personalQuotes.length === 0) {
        console.log(chalk.yellow('No matches found.'));
        return;
      }

      console.log(chalk.bold(`\nPersonal Quotes (${personalQuotes.length}):\n`));
      for (const quote of personalQuotes) {
        console.log(formatQuote(quote));
        console.log(chalk.dim(`ID: ${quote.id}\n`));
      }
    } catch (error) {
      console.error(chalk.red('Failed to list quotes:'), error);
      process.exit(1);
    }
  });

personalCommand.addCommand(addCmd);
personalCommand.addCommand(deleteCmd);
personalCommand.addCommand(updateCmd);
personalCommand.addCommand(listCmd);

export default personalCommand;
