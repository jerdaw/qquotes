import { OpenAPIHono } from '@hono/zod-openapi';
import { getInstance, init } from '@qquotes/core';
import { apiReference } from '@scalar/hono-api-reference';
import { corsConfig } from './middleware/cors';
import { logger } from './middleware/logger';

import { rateLimiter } from 'hono-rate-limiter';
import { prettyJSON } from 'hono/pretty-json';
import { requestId } from 'hono/request-id';
import { streamText } from 'hono/streaming';

// import { logger } from 'hono-pino'; // Removed
// import { cors } from 'hono/cors'; // Removed

import authors from './routes/authors';
import personal from './routes/personal';
// Import modular routes
import quotes from './routes/quotes';
import tags from './routes/tags';

import { readFileSync, existsSync } from 'node:fs';
import { QuoteSchema } from './schemas';
import { config } from './config';
import { z } from 'zod';

// Import data
import quotesData from '@qquotes/data/quotes' with { type: 'json' };

// Initialize core store
let personalQuotes = [];
const personalPath = config.data.personalPath;

if (existsSync(personalPath)) {
  try {
    const data = readFileSync(personalPath, 'utf-8');
    const parsed = JSON.parse(data);
    
    // Validate on startup
    const result = z.array(QuoteSchema).safeParse(parsed);
    if (result.success) {
      personalQuotes = result.data;
      console.log(`Loaded ${personalQuotes.length} validated personal quotes.`);
    } else {
      console.error('Data Integrity Error: personal.json failed validation!');
      console.error(result.error.format());
      // For now, we load what we can or start empty to prevent crash, 
      // but in production this might stop the server.
    }
  } catch (e) {
    console.error('Failed to read personal quotes:', e);
  }
}

init({
  quotes: quotesData,
  personalQuotes: personalQuotes,
});

const app = new OpenAPIHono();

// Middleware
app.use('*', requestId());
app.use('*', logger);
app.use('*', corsConfig);
app.use('*', prettyJSON());

// Rate limiting
const limiter = rateLimiter({
  windowMs: 60 * 1000,
  limit: 100,
  keyGenerator: (c) =>
    c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'anonymous',
  handler: (c) => c.json({ error: 'Too many requests', retryAfter: 60 }, 429),
});

app.use('/quotes/*', limiter);

app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({ error: err.message }, 500);
});

// Routes
// Note: These will be refactored to strict OpenAPI routes next
app.route('/quotes', quotes);
app.route('/authors', authors);
app.route('/tags', tags);
app.route('/personal', personal);

// Stats route
app.get('/stats', (c) => {
  return c.json(getInstance().stats());
});

// Streaming endpoint
app.get('/stream', (c) => {
  const all = getInstance().all();
  return streamText(c, async (stream) => {
    for (const quote of all) {
      // NDJSON format
      await stream.writeln(JSON.stringify(quote));
      await stream.sleep(1);
    }
  });
});

// Generated OpenAPI Doc
app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'QQuotes API',
    version: '1.0.0',
    description: 'A modern, fast, reliable quotes library and API.',
  },
});

app.get('/debug-openapi', async (c) => {
  try {
    const doc = app.getOpenAPI31Document({
      openapi: '3.1.0',
      info: { title: 'Debug', version: '1' },
    });
    return c.json(doc);
    // biome-ignore lint/suspicious/noExplicitAny: Generic error handling
  } catch (e: any) {
    return c.json({ error: e.message, stack: e.stack }, 500);
  }
});

// Scalar API Reference
app.get(
  '/doc',
  apiReference({
    spec: { url: '/openapi.json' },
    theme: 'purple',
    // biome-ignore lint/suspicious/noExplicitAny: Scalar types issue
  } as any),
);

// Home route
app.get('/', (c) => {
  return c.json({
    message: 'Welcome to QQuotes API',
    docs: '/doc',
  });
});

export default app;
