import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { getInstance } from '@qquotes/core';

const routes = new OpenAPIHono();

const AuthorListSchema = z.array(
  z.object({
    name: z.string(),
    count: z.number(),
  }),
);

const listAuthors = createRoute({
  method: 'get',
  path: '/',
  summary: 'List all authors',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AuthorListSchema,
        },
      },
      description: 'List of authors with quote counts',
    },
  },
});

routes.openapi(listAuthors, (c) => {
  const q = getInstance();
  const authors = q.authors().map((name) => ({
    name,
    count: q.byAuthor(name).length,
  }));
  return c.json(authors, 200);
});

export default routes;
