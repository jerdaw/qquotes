import * as fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { type Quote, QuoteSchema } from '@qquotes/core';

export class ConfigManager {
  private static getStorageDir(): string {
    const home = os.homedir();
    const configHome = process.env.XDG_CONFIG_HOME || path.join(home, '.config');
    return path.join(configHome, 'qquotes');
  }

  private static getStoragePath(): string {
    return path.join(this.getStorageDir(), 'quotes.json');
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

  static async savePersonalQuote(quote: Quote) {
    await this.ensureStorageExists();
    const quotes = await this.loadPersonalQuotes();
    
    const existingIndex = quotes.findIndex((q) => q.id === quote.id);
    if (existingIndex >= 0) {
      quotes[existingIndex] = quote;
    } else {
      quotes.push(quote);
    }

    await fs.writeFile(this.getStoragePath(), JSON.stringify(quotes, null, 2));
  }
}
