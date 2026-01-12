import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { getInstance } from '@qquotes/core';

const routes = new OpenAPIHono();

import { QuoteSchema } from '@qquotes/core';

// Schemas
// QuoteSchema imported from core

const ErrorSchema = z.object({
  error: z.string(),
});

const PaginationMetaSchema = z.object({
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

// const ListResponseSchema = z.object({
//   data: z.array(z.object({ id: z.string(), text: z.string() })),
//   meta: z.object({}),
// });
const ListResponseSchema = z.object({
  data: z.array(QuoteSchema),
  meta: PaginationMetaSchema,
});

// Routes Definitions

const listQuotes = createRoute({
  method: 'get',
  path: '/',
  summary: 'List quotes',
  request: {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).optional().default(20),
      offset: z.coerce.number().min(0).optional().default(0),
      author: z.string().optional(),
      tag: z.string().optional(),
      q: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          // listQuotes response
          schema: ListResponseSchema,
        },
      },
      description: 'List of quotes',
    },
  },
});

const randomQuotes = createRoute({
  method: 'get',
  path: '/random',
  summary: 'Get random quotes',
  request: {
    query: z.object({
      count: z.coerce.number().min(1).max(50).optional().default(1),
      mode: z.enum(['all', 'personal', 'mixed']).optional(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.union([QuoteSchema, z.array(QuoteSchema)]),
        },
      },
      description: 'Random quote(s)',
    },
  },
});

const getQuoteById = createRoute({
  method: 'get',
  path: '/{id}',
  summary: 'Get quote by ID',
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: QuoteSchema,
        },
      },
      description: 'The quote',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Quote not found',
    },
  },
});

// Implementation

routes.openapi(listQuotes, (c) => {
  const q = getInstance();
  const { limit, offset, author, tag, q: query } = c.req.valid('query');

  // biome-ignore lint/suspicious/noExplicitAny: Temporary loose typing
  let results: any;
  if (query) {
    results = q.search(query);
  } else if (author) {
    results = q.byAuthor(author);
  } else if (tag) {
    results = q.byTag(tag);
  } else {
    results = q.all();
  }

  const paginated = results.slice(offset, offset + limit);
  return c.json({
    data: paginated,
    meta: {
      total: results.length,
      limit,
      offset,
    },
  });
});

routes.openapi(randomQuotes, (c) => {
  const q = getInstance();
  const { count, mode } = c.req.valid('query');

  // mode defaults to 'all' if undefined, which matches logic in store
  // Cast mode to QuoteMode (zod enum ensures safety)
  // biome-ignore lint/suspicious/noExplicitAny: explicit cast
  const selectedMode = mode as any;

  if (count === 1) {
    return c.json(q.random(selectedMode));
  }
  return c.json(q.random(count, selectedMode));
});

routes.openapi(getQuoteById, (c) => {
  const q = getInstance();
  const { id } = c.req.valid('param');
  const quote = q.get(id);

  if (!quote) {
    return c.json({ error: 'Quote not found' }, 404);
  }
  return c.json(quote, 200);
});

export default routes;
