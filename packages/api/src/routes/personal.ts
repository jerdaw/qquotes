import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { type Quote, getInstance } from '@qquotes/core';
import { QuoteSchema } from '../schemas';

const app = new OpenAPIHono();

const __dirname = dirname(fileURLToPath(import.meta.url));
const personalDataPath = resolve(__dirname, '../../../../data/src/personal.json');

let isWriting = false;

const CreateQuoteSchema = z.object({
  id: z.string().uuid().optional(),
  text: z.string().min(1).max(500),
  author: z.string().min(1).max(100),
  tags: z.array(z.string()).default([]),
});

const route = createRoute({
  method: 'post',
  path: '/',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: QuoteSchema,
        },
      },
      description: 'Quote added successfully',
    },
    409: {
      description: 'Quote ID already exists',
    },
    429: {
      description: 'Concurrent write limit exceeded',
    },
    500: {
      description: 'Server error',
    },
  },
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateQuoteSchema,
        },
      },
    },
  },
});

app.openapi(route, async (c) => {
  const body = c.req.valid('json');
  const store = getInstance();

  const id = body.id || crypto.randomUUID();

  const { text, author, tags } = body;
  const newQuote: Quote = {
    id,
    text,
    author,
    tags,
    metadata: {
      addedAt: new Date().toISOString(),
      verified: false,
    },
  };

  // Removed collision check to allow updates/shadowing
  // if (store.get(id)) { ... }

  // Simple concurrency lock
  if (isWriting) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (isWriting) {
      return c.json({ error: 'Concurrent write limit exceeded' }, 429);
    }
  }

  isWriting = true;
  try {
    // Upate in-memory store
    store.addPersonalQuote(newQuote);

    // Persist to disk
    let fileContent: Quote[] = [];
    try {
      const data = await readFile(personalDataPath, 'utf-8');
      fileContent = JSON.parse(data);
    } catch (e) {
      // Create new if missing or invalid
      console.warn('Could not read personal.json, starting fresh', e);
    }

    // Check for existing ID in fileContent and replace if found
    const existingIndex = fileContent.findIndex((q) => q.id === id);
    if (existingIndex >= 0) {
      fileContent[existingIndex] = newQuote;
    } else {
      fileContent.push(newQuote);
    }
    await writeFile(personalDataPath, JSON.stringify(fileContent, null, 2));

    return c.json(newQuote, 200);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return c.json({ error: message }, 500);
  } finally {
    isWriting = false;
  }
});

export default app;
