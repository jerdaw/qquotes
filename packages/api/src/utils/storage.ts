import * as fs from 'fs/promises';
const { writeFile, rename } = fs;
import { dirname, join } from 'node:path';

/**
 * Simple Async Lock to serialize operations (e.g. file writes)
 */
export class AsyncLock {
  private promise: Promise<void> = Promise.resolve();

  async acquire(): Promise<() => void> {
    let release: () => void;
    const nextPromise = new Promise<void>((resolve) => {
      release = resolve;
    });
    const currentPromise = this.promise;
    this.promise = currentPromise.then(() => nextPromise);
    await currentPromise;
    return release!;
  }

  /**
   * Run a task with the lock held
   */
  async runExclusive<T>(task: () => Promise<T>): Promise<T> {
    const release = await this.acquire();
    try {
      return await task();
    } finally {
      release();
    }
  }
}

/**
 * Atomic File Writer
 * Writes to a temporary file and renames it to the target path.
 * This ensures that the file is never in a partially written state.
 */
export class AtomicWriter {
  constructor(private targetPath: string) {}

  async write(content: string): Promise<void> {
    const tempPath = `${this.targetPath}.${Math.random().toString(36).slice(2)}.tmp`;
    
    try {
      await writeFile(tempPath, content, 'utf-8');
      await rename(tempPath, this.targetPath);
    } catch (error) {
       // Cleanup temp file if write failed but rename didn't happen
       try {
         const fs = await import('node:fs/promises');
         await fs.unlink(tempPath);
       } catch {
         // Ignore cleanup error
       }
       throw error;
    }
  }
}

// Singleton instances for common usage
export const storageLock = new AsyncLock();
