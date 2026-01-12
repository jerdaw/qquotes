import { logger as honoLogger } from 'hono-pino';

export const logger = honoLogger({
  pino: {
    level: 'info',
    formatters: {
      level: (label: string) => ({ level: label }),
    },
  },
});
