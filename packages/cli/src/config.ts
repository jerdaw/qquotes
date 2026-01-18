import * as fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { type Quote, QuoteSchema } from '@qquotes/core';
import { StorageLock } from './utils/lock';

export class ConfigManager {
  static getStorageDir(): string {
    const home = os.homedir();
    const configHome = process.env.XDG_CONFIG_HOME || path.join(home, '.config');
    return path.join(configHome, 'qquotes');
  }

  static getStoragePath(): string {
    return path.join(this.getStorageDir(), 'quotes.json');
  }

  private static getBackupPath(): string {
    return path.join(this.getStorageDir(), 'quotes.backup.json');
  }

  static async ensureStorageExists() {
    const dir = this.getStorageDir();
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  static async loadPersonalQuotes(): Promise<Quote[]> {
    try {
      const filePath = this.getStoragePath();
      if (!existsSync(filePath)) {
        return [];
      }
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      if (!Array.isArray(data)) {
        return [];
      }

      const validQuotes: Quote[] = [];
      for (const item of data) {
        const result = QuoteSchema.safeParse(item);
        if (result.success) {
          validQuotes.push(result.data);
        }
      }
      return validQuotes;
    } catch (error) {
      console.error('Failed to load personal quotes:', error);
      return [];
    }
  }

  private static async createBackup(): Promise<void> {
    const sourcePath = this.getStoragePath();
    if (existsSync(sourcePath)) {
      await fs.copyFile(sourcePath, this.getBackupPath());
    }
  }

  static async restoreBackup(): Promise<boolean> {
    const backupPath = this.getBackupPath();
    if (!existsSync(backupPath)) return false;
    await fs.copyFile(backupPath, this.getStoragePath());
    return true;
  }

  static async savePersonalQuote(quote: Quote) {
    return StorageLock.withLock(async () => {
      await this.ensureStorageExists();
      await this.createBackup();

      try {
        const quotes = await this.loadPersonalQuotes();
        const existingIndex = quotes.findIndex((q) => q.id === quote.id);
        if (existingIndex >= 0) {
          quotes[existingIndex] = quote;
        } else {
          quotes.push(quote);
        }
        await fs.writeFile(this.getStoragePath(), JSON.stringify(quotes, null, 2));
      } catch (error) {
        console.error('Write failed, restoring backup...');
        await this.restoreBackup();
        throw error;
      }
    });
  }

  static async deletePersonalQuote(id: string): Promise<boolean> {
    return StorageLock.withLock(async () => {
      await this.ensureStorageExists();
      await this.createBackup();

      try {
        const quotes = await this.loadPersonalQuotes();
        const filtered = quotes.filter((q) => q.id !== id);
        if (filtered.length === quotes.length) return false;
        await fs.writeFile(this.getStoragePath(), JSON.stringify(filtered, null, 2));
        return true;
      } catch (error) {
        console.error('Delete failed, restoring backup...');
        await this.restoreBackup();
        throw error;
      }
    });
  }
}
