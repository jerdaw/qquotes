
import { describe, expect, test, afterAll, beforeAll } from 'bun:test';
import { unlinkSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Set test data path before importing app
const testPersonalPath = resolve(__dirname, 'personal.test.json');
process.env.PERSONAL_DATA_PATH = testPersonalPath;

// Initialize empty test file
writeFileSync(testPersonalPath, '[]');

import app from '../index';
import { getInstance } from '@qquotes/core';

describe('API Shadowing & Updates', () => {
  afterAll(() => {
    if (existsSync(testPersonalPath)) {
      unlinkSync(testPersonalPath);
    }
  });

  test('can shadow a system quote with a personal one', async () => {
    // 1. Get a quote from the system
    const res1 = await app.request('/quotes/random');
    const systemQuote = await res1.json();
    const targetId = systemQuote.id;

    // 2. "Shadow" it by posting to /personal with same ID
    const personalText = 'This is a shadowed version of the quote.';
    const postRes = await app.request('/personal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: targetId,
        text: personalText,
        author: systemQuote.author,
        tags: systemQuote.tags
      })
    });

    expect(postRes.status).toBe(200);
    const postData = await postRes.json();
    expect(postData.text).toBe(personalText);

    // 3. Verify it is now returned by the quote endpoint (shadowing)
    const res2 = await app.request(`/quotes/random?mode=all`);
    // Note: random might return another quote. Let's look it up specifically.
    // Wait, let's assume random with ID? No such endpoint.
    // Let's check getInstance() directly or use search.
    
    const store = getInstance();
    const fetched = store.get(targetId);
    expect(fetched?.text).toBe(personalText);
  });

  test('persists between requests (simulated by store check)', async () => {
    // This is already checked by the POST route which writes to file
    // and updates the store.
    const store = getInstance();
    const quotes = store.all();
    const shadowed = quotes.find(q => q.text === 'This is a shadowed version of the quote.');
    expect(shadowed).toBeDefined();
  });
});
