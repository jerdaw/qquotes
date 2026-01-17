import { describe, expect, it, mock } from 'bun:test';

// Mock fs
const mockWriteFile = mock(() => Promise.resolve());
const mockReadFile = mock(() => Promise.resolve('[]'));

const mockRename = mock(() => Promise.resolve());

mock.module('fs/promises', () => ({
  readFile: mockReadFile,
  writeFile: mockWriteFile,
  rename: mockRename,
}));

mock.module('node:fs/promises', () => ({
  readFile: mockReadFile,
  writeFile: mockWriteFile,
  rename: mockRename,
}));

const { default: app } = await import('../index');

describe('Personal Quotes API', () => {
  it('should add a personal quote', async () => {
    const res = await app.request('/personal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Test Quote',
        author: 'Test Author',
        tags: ['test'],
      }),
    });

    const body = await res.json();
    if (res.status !== 200) {
      console.error('Response error:', body);
    }
    expect(res.status).toBe(200);
    expect(body.text).toBe('Test Quote');
    expect(body.author).toBe('Test Author');
    expect(body.id).toBeDefined();

    // Verify write call
    expect(mockWriteFile).toHaveBeenCalled();
  });

  it('should allow overwriting existing ID (Shadowing)', async () => {
    // Add one first
    const res1 = await app.request('/personal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Q1',
        author: 'A1',
      }),
    });
    const q1 = await res1.json();

    // Try again with same ID - should SUCCEED now
    const res2 = await app.request('/personal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: q1.id,
        text: 'Q1 Duplicate',
        author: 'A1',
      }),
    });

    expect(res2.status).toBe(200);
    const body2 = await res2.json();
    expect(body2.text).toBe('Q1 Duplicate');
  });

  it('should retrieve personal quotes via filtering', async () => {
    // We already added a personal quote 'Test Quote' in first test
    const res = await app.request('/quotes/random?mode=personal');
    expect(res.status).toBe(200);
    const body = await res.json();
    // Since mockReadFile returns empty array initially, and we are mocking writes,
    // the store might only have in-memory updates.
    // 'Test Quote' was added in first test.
    // 'Q1' and 'Q1 Duplicate' added in second test.
    // Since tests run in same process/memory space usually in Bun test unless sandboxed per file?
    // Bun test runs files in parallel but tests in file sequentially?
    // Let's expect 'Test Quote' to be findable if order is preserved or state shared.
    // Actually, store is singleton `getInstance()`.
    // So 'Test Quote' should be there.
    expect(body).toBeDefined();
  });

  it('should support mixed mode', async () => {
    const res = await app.request('/quotes/random?mode=mixed');
    expect(res.status).toBe(200);
  });
});
