import { beforeAll, describe, expect, test } from 'bun:test';
import { init } from '../index';
import type { Quote } from '../schema';

describe('Performance Regression', () => {
  // biome-ignore lint/suspicious/noExplicitAny: Test context
  let q: any;
  const mockQuotes: Quote[] = Array.from({ length: 1000 }, (_, i) => ({
    id: crypto.randomUUID(),
    text: `This is quote number ${i} with some unique text content for searching purposes.`,
    author: `Author ${i % 100}`,
    tags: [`tag${i % 10}`, 'common'],
    metadata: { addedAt: new Date().toISOString(), verified: true },
  }));

  beforeAll(() => {
    q = init({ quotes: mockQuotes });
  });

  test('random() executes in < 1ms', () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      q.random();
    }
    const end = performance.now();
    const avg = (end - start) / 100;
    expect(avg).toBeLessThan(1); // 1ms threshold
  });

  test('get() executes in < 1ms', () => {
    const id = mockQuotes[500].id;
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      q.get(id);
    }
    const end = performance.now();
    const avg = (end - start) / 100;
    expect(avg).toBeLessThan(1); // 1ms threshold
  });

  test('search() executes in < 5ms', () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      q.search('unique');
    }
    const end = performance.now();
    const avg = (end - start) / 100;
    expect(avg).toBeLessThan(5); // 5ms threshold
  });
});
