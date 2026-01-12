import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { getInstance } from '@qquotes/core';

const routes = new OpenAPIHono();

const TagListSchema = z.array(
  z.object({
    name: z.string(),
    count: z.number(),
  }),
);

const listTags = createRoute({
  method: 'get',
  path: '/',
  summary: 'List all tags',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TagListSchema,
        },
      },
      description: 'List of tags with quote counts',
    },
  },
});

routes.openapi(listTags, (c) => {
  const q = getInstance();
  const tags = q.tags().map((name) => ({
    name,
    count: q.byTag(name).length,
  }));
  return c.json(tags, 200);
});

export default routes;
