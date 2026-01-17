import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const config = {
  data: {
    // Priority: Env var > Project root relative path
    personalPath: process.env.PERSONAL_DATA_PATH || resolve(__dirname, '../../data/src/personal.json'),
    systemPath: process.env.SYSTEM_DATA_PATH || resolve(__dirname, '../../data/src/quotes.json'),
  },
  api: {
    port: parseInt(process.env.PORT || '3000', 10),
  }
};
