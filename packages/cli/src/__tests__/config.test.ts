import { describe, expect, it, afterEach, beforeEach } from 'bun:test';
import * as fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ConfigManager } from '../config';
import { v4 as uuidv4 } from 'uuid';

describe('ConfigManager', () => {
    const testDir = path.join(os.tmpdir(), 'qquotes-test-' + Date.now());
    
    beforeEach(async () => {
        process.env.XDG_CONFIG_HOME = testDir;
    });

    afterEach(async () => {
        if (existsSync(testDir)) {
            await fs.rm(testDir, { recursive: true, force: true });
        }
    });

    it('should load empty array if config does not exist', async () => {
        const quotes = await ConfigManager.loadPersonalQuotes();
        expect(quotes).toEqual([]);
    });

    it('should save and load a quote', async () => {
        const quote = {
            id: uuidv4(),
            text: 'Test Quote',
            author: 'Test Author',
            tags: ['test'],
            metadata: {
                addedAt: new Date().toISOString(),
                verified: false
            }
        };

        await ConfigManager.savePersonalQuote(quote as any);
        const quotes = await ConfigManager.loadPersonalQuotes();
        
        expect(quotes).toHaveLength(1);
        expect(quotes[0]!.text).toBe('Test Quote');
        expect(quotes[0]!.id).toBe(quote.id);
    });

    it('should correctly handle updates to existing quotes', async () => {
        const id = uuidv4();
        const quote1 = {
            id,
            text: 'Version 1',
            author: 'Author',
            tags: [],
            metadata: { addedAt: new Date().toISOString(), verified: false }
        };
        const quote2 = {
            id,
            text: 'Version 2',
            author: 'Author',
            tags: [],
            metadata: { addedAt: new Date().toISOString(), verified: false }
        };

        await ConfigManager.savePersonalQuote(quote1 as any);
        await ConfigManager.savePersonalQuote(quote2 as any);
        
        const quotes = await ConfigManager.loadPersonalQuotes();
        expect(quotes).toHaveLength(1);
        expect(quotes[0]!.text).toBe('Version 2');
    });
});
