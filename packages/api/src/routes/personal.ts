import { readFile } from 'node:fs/promises';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { type Quote, getInstance } from '@qquotes/core';
import { QuoteSchema } from '../schemas';
import { config } from '../config';
import { AtomicWriter, storageLock } from '../utils/storage';

const app = new OpenAPIHono();
const writer = new AtomicWriter(config.data.personalPath);

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

  try {
    // Use the serializing lock for all write operations
    return await storageLock.runExclusive(async () => {
      // Update in-memory store
      store.addPersonalQuote(newQuote);

      // Persist to disk
      let fileContent: Quote[] = [];
      try {
        const data = await readFile(config.data.personalPath, 'utf-8');
        fileContent = JSON.parse(data);
      } catch (e) {
        // Start fresh if file missing/invalid
        console.warn('Could not read personal.json, starting fresh');
      }

      // Check for existing ID in fileContent and replace if found
      const existingIndex = fileContent.findIndex((q) => q.id === id);
      if (existingIndex >= 0) {
        fileContent[existingIndex] = newQuote;
      } else {
        fileContent.push(newQuote);
      }

      // Atomic write to disk
      await writer.write(JSON.stringify(fileContent, null, 2));

      return c.json(newQuote, 200);
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('Persistence failed:', e);
    return c.json({ error: message }, 500);
  }
});

export default app;
