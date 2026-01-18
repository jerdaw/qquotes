import lockfile from 'proper-lockfile';
import { ConfigManager } from '../config';
import * as fs from 'node:fs/promises';
import { existsSync } from 'node:fs';

export class StorageLock {
  static async withLock<T>(fn: () => Promise<T>): Promise<T> {
    const filePath = ConfigManager.getStoragePath();
    await ConfigManager.ensureStorageExists();

    // Ensure the file exists before trying to lock it
    if (!existsSync(filePath)) {
      await fs.writeFile(filePath, '[]');
    }

    let release: (() => Promise<void>) | undefined;
    try {
      release = await lockfile.lock(filePath, {
        retries: { retries: 10, minTimeout: 100, maxTimeout: 500 },
        stale: 5000
      });
      return await fn();
    } finally {
      if (release) await release();
    }
  }
}
