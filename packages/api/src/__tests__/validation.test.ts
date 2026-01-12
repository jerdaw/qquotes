import { describe, expect, it } from 'bun:test';
import app from '../index';

describe('API Input Validation', () => {
  describe('POST /personal', () => {
    it('should return 400 for missing mandatory fields', async () => {
      const res = await app.request('/personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: 'Author only' }),
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for empty text', async () => {
      const res = await app.request('/personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '', author: 'Me' }),
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for overly long text', async () => {
      const res = await app.request('/personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'a'.repeat(501), author: 'Me' }),
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid ID format (not UUID)', async () => {
      const res = await app.request('/personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'invalid-id', text: 'Valid', author: 'Me' }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /quotes', () => {
    it('should return 400 for invalid limit', async () => {
      const res = await app.request('/quotes?limit=999');
      expect(res.status).toBe(400);
    });
  });
});
