import { getInstance } from './index';
import type { SearchOptions } from './schema';

export function byAuthor(author: string) {
  return getInstance().byAuthor(author);
}

export function byTag(tag: string) {
  return getInstance().byTag(tag);
}

export function byTags(tags: string[], mode?: 'all' | 'any') {
  return getInstance().byTags(tags, mode);
}

export function search(query: string, options?: SearchOptions) {
  return getInstance().search(query, options);
}

export function authors() {
  return getInstance().authors();
}

export function tags() {
  return getInstance().tags();
}
