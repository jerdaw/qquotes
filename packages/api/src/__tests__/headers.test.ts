import { describe, expect, it } from 'bun:test';
import app from '../index';

describe('API Headers & Security', () => {
  it('should have correct CORS headers', async () => {
    const res = await app.request('/quotes/random', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://example.com',
        'Access-Control-Request-Method': 'GET',
      },
    });

    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });

  it('should have X-Request-Id header', async () => {
    const res = await app.request('/');
    expect(res.headers.get('X-Request-Id')).toBeDefined();
  });

  it('should have RateLimit headers on /quotes routes', async () => {
    const res = await app.request('/quotes/random');
    expect(res.headers.get('X-RateLimit-Limit')).toBeDefined();
    expect(res.headers.get('X-RateLimit-Remaining')).toBeDefined();
  });
});
