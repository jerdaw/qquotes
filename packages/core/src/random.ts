import { getInstance } from './index';
import type { Quote } from './schema';

export function random(): Quote;
export function random(count: number): Quote[];
export function random(count?: number): Quote | Quote[] {
  if (count === undefined) {
    return getInstance().random();
  }
  return getInstance().random(count);
}

export function randomByAuthor(author: string): Quote | undefined {
  const quotes = getInstance().byAuthor(author);
  if (quotes.length === 0) return undefined;
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export function randomByTag(tag: string): Quote | undefined {
  const quotes = getInstance().byTag(tag);
  if (quotes.length === 0) return undefined;
  return quotes[Math.floor(Math.random() * quotes.length)];
}
