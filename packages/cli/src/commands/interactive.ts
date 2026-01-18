import { Command } from 'commander';
import { select, input, search } from '@inquirer/prompts';
import { init } from '@qquotes/core';
import chalk from 'chalk';
import { formatQuote } from '../utils';
import { ConfigManager } from '../config';

// Re-using the singleton instance pattern logic would be better
// but for CLI we can just re-init or pass it in.
// Since imports are static, we do the same imports as index.ts
import byAuthor from '@qquotes/data/index-author' with { type: 'json' };
import byTag from '@qquotes/data/index-tag' with { type: 'json' };
import quotes from '@qquotes/data/quotes' with { type: 'json' };
import searchIndex from '@qquotes/data/search-index' with { type: 'json' };
import stats from '@qquotes/data/stats' with { type: 'json' };

export const interactiveCommand = new Command('interactive')
  .alias('i')
  .description('Start interactive mode')
  .action(async () => {
    // Initialize Core
    const personalQuotes = await ConfigManager.loadPersonalQuotes();
    const q = init({
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

    console.clear();
    console.log(chalk.bold.blue('Welcome to QQuotes Interactive Mode! 🚀'));

    let running = true;

    while (running) {
      console.log(''); // spacer
      const action = await select({
        message: 'What would you like to do?',
        choices: [
          { name: '🎲  Get a Random Quote', value: 'random' },
          { name: '🔍  Search Quotes', value: 'search' },
          { name: '👤  Browse by Author', value: 'author' },
          { name: '🏷️   Browse by Tag', value: 'tag' },
          { name: '📒  My Collection', value: 'personal' },
          { name: '👋  Exit', value: 'exit' },
        ],
      });

      try {
        if (action === 'exit') {
          console.log(chalk.dim('Goodbye! Keep inspired.'));
          running = false;
        } else if (action === 'random') {
          const quote = q.random();
          console.log(formatQuote(quote));
        } else if (action === 'search') {
          const query = await input({ message: 'Enter search term:' });
          if (query.trim()) {
            const allResults = q.search(query);
            const results = allResults.slice(0, 5);
            if (results.length === 0) {
              console.log(chalk.yellow('No results found.'));
            } else {
              console.log(chalk.dim(`Found ${allResults.length} results (showing top 5):`));
              for (const quote of results) {
                console.log(formatQuote(quote));
              }
            }
          }
        } else if (action === 'author') {
            // Using search prompt for filtering authors
            const authors = q.authors();
            const selectedAuthor = await search({
                message: 'Select an author',
                source: async (term) => {
                    if (!term) return authors.slice(0, 10).map(a => ({ value: a }));
                    return authors
                        .filter(a => a.toLowerCase().includes(term.toLowerCase()))
                        .slice(0, 10)
                        .map(a => ({ value: a }));
                },
            });
            
            if (selectedAuthor) {
                const quotes = q.byAuthor(selectedAuthor);
                // biome-ignore lint/style/noNonNullAssertion: guaranteed by logic
                console.log(formatQuote(quotes[0]!));
                if (quotes.length > 1) {
                    console.log(chalk.dim(`(and ${quotes.length - 1} more from this author...)`));
                }
            }
        } else if (action === 'tag') {
           const tags = q.tags();
           const selectedTag = await search({
               message: 'Select a tag',
               source: async (term) => {
                   if (!term) return tags.slice(0, 10).map(t => ({ value: t }));
                   return tags
                       .filter(t => t.toLowerCase().includes(term.toLowerCase()))
                       .slice(0, 10)
                       .map(t => ({ value: t }));
               },
           });

           if (selectedTag) {
               const quotes = q.byTag(selectedTag);
               // biome-ignore lint/style/noNonNullAssertion: guaranteed by logic
               console.log(formatQuote(quotes[0]!));
               if (quotes.length > 1) {
                   console.log(chalk.dim(`(and ${quotes.length - 1} more with this tag...)`));
               }
           }
        } else if (action === 'personal') {
           const myQuotes = await ConfigManager.loadPersonalQuotes();
           if (myQuotes.length === 0) {
               console.log(chalk.yellow("You haven't saved any quotes yet. Use 'qquotes fetch <url>' or add them manually!"));
           } else {
               console.log(chalk.bold(`You have ${myQuotes.length} saved quotes.`));
               const quote = myQuotes[Math.floor(Math.random() * myQuotes.length)];
               console.log(chalk.dim('Here is one from your collection:'));
               // biome-ignore lint/style/noNonNullAssertion: guaranteed by length check
               console.log(formatQuote(quote!));
           }
        }
      } catch (e) {
          // Handle cancellations (Ctrl+C during prompt) gracefully
          console.log(chalk.yellow('\nAction cancelled.'));
      }
    }
  });
