import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { QuoteSchema } from '../packages/core/src/schema';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '../packages/data/src');

console.log('🔍 Checking data compatibility...');

const files = readdirSync(dataDir).filter(f => f.endsWith('.json'));

let hasError = false;

for (const file of files) {
  const path = resolve(dataDir, file);
  console.log(`  - Checking ${file}...`);
  try {
    const data = JSON.parse(readFileSync(path, 'utf-8'));
    const result = z.array(QuoteSchema).safeParse(data);
    
    if (!result.success) {
      console.error(`❌ Validation failed for ${file}:`);
      console.error(result.error.format());
      hasError = true;
    } else {
      console.log(`✅ ${file} is compatible (${result.data.length} quotes)`);
    }
  } catch (e) {
    console.error(`💥 Error reading/parsing ${file}:`, e);
    hasError = true;
  }
}

if (hasError) {
  console.error('\n❌ Data compatibility check failed!');
  process.exit(1);
} else {
  console.log('\n✨ All data files are compatible with core schema!');
  process.exit(0);
}
