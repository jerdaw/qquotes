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

const deleteRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean(), message: z.string() }),
        },
      },
      description: 'Deleted',
    },
    404: { description: 'Not found' },
    403: { description: 'Cannot delete system quote' },
  },
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
});

app.openapi(deleteRoute, async (c) => {
  const { id } = c.req.valid('param');
  const store = getInstance();

  try {
    return await storageLock.runExclusive(async () => {
      const success = store.deletePersonalQuote(id);
      if (!success) return c.json({ error: 'Not found' }, 404);

      let fileContent: Quote[] = [];
      try {
        const data = await readFile(config.data.personalPath, 'utf-8');
        fileContent = JSON.parse(data);
      } catch (e) {
        // File might not exist yet
        console.warn('Could not read personal.json');
      }

      const updated = fileContent.filter((q) => q.id !== id);
      await writer.write(JSON.stringify(updated, null, 2));

      return c.json({ success: true, message: 'Deleted' }, 200);
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('Cannot delete system quote')) {
      return c.json({ error: e.message }, 403);
    }
    console.error('Delete failed:', e);
    return c.json({ error: String(e) }, 500);
  }
});

export default app;
