export * from './schema';
export * from './store';
export * from './search';
export * from './types';
export * from './random';
export * from './query';

import { QQuotes } from './store';
import type { QQuotesOptions } from './types';

let instance: QQuotes | null = null;

export function init(options: QQuotesOptions) {
  instance = new QQuotes(options);
  return instance;
}

export function getInstance() {
  if (!instance) {
    throw new Error('QQuotes not initialized. Call init() first.');
  }
  return instance;
}
