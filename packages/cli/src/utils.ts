import type { Quote } from '@qquotes/core';
import chalk from 'chalk';

export type OutputFormat = 'text' | 'json' | 'markdown';

export function formatQuote(quote: Quote, format: OutputFormat = 'text'): string {
  switch (format) {
    case 'json':
      return JSON.stringify(quote, null, 2);
    case 'markdown':
      return `> ${quote.text}\n>\n> — **${quote.author}**`;
    default:
      return `\n"${chalk.italic(quote.text)}"\n— ${chalk.bold(quote.author)}`;
  }
}

export function formatQuotes(quotes: Quote[], format: OutputFormat = 'text'): string {
  if (format === 'json') {
    return JSON.stringify(quotes, null, 2);
  }
  return quotes.map((q) => formatQuote(q, format)).join('\n');
}
