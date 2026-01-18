import { beforeAll, describe, expect, test } from "bun:test";
import { getInstance, init } from "../index";
import type { Quote } from "../schema";

describe("qquotes Store", () => {
    // biome-ignore lint/suspicious/noExplicitAny: Test context
    let q: any;
    const mockQuotes: Quote[] = [
        {
            id: "550e8400-e29b-41d4-a716-446655440000",
            text: "The best way to predict your future is to create it.",
            author: "Peter Drucker",
            tags: ["future", "action", "motivation"],
            metadata: { addedAt: new Date().toISOString(), verified: true },
        },
        {
            id: "3e84386e-b873-41c9-8dcb-0563229b35fd",
            text: "Everything you've ever wanted is on the other side of fear.",
            author: "George Addair",
            tags: ["fear", "motivation"],
            metadata: { addedAt: new Date().toISOString(), verified: true },
        },
    ];

    beforeAll(() => {
        q = init({ quotes: mockQuotes });
    });

    test("random() returns a valid quote", () => {
        const quote = q.random();
        expect(quote).toHaveProperty("id");
        expect(mockQuotes.map((mq) => mq.id)).toContain(quote.id);
    });

    test("random(n) returns n unique quotes", () => {
        const result = q.random(2);
        expect(result).toHaveLength(2);
        // biome-ignore lint/suspicious/noExplicitAny: Test check
        expect(new Set(result.map((quote: any) => quote.id)).size).toBe(2);
    });

    test("get(id) returns the correct quote", () => {
        const quote = q.get(mockQuotes[0].id);
        expect(quote?.text).toBe(mockQuotes[0].text);
    });

    test("byAuthor() is case-insensitive", () => {
        const results = q.byAuthor("peter drucker");
        expect(results).toHaveLength(1);
        expect(results[0].author).toBe("Peter Drucker");
    });

    test("byTag() returns filtered quotes", () => {
        const results = q.byTag("fear");
        expect(results).toHaveLength(1);
        expect(results[0].tags).toContain("fear");
    });

    test("search() finds quotes by text", () => {
        const results = q.search("future");
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].text).toContain("future");
    });

    test("stats() provides accurate collection data", () => {
        const s = q.stats();
        expect(s.totalQuotes).toBe(2);
        expect(s.totalAuthors).toBe(2);
        expect(s.totalTags).toBe(4);
    });

    describe("Personalization & Modes", () => {
        const personalQuote: Quote = {
            id: "personal-1",
            text: "My personal quote",
            author: "Me",
            tags: ["original"],
            metadata: { addedAt: new Date().toISOString(), verified: false },
        };

        const shadowQuote: Quote = {
            id: mockQuotes[0].id, // Same ID as system quote
            text: "Shadowed text",
            author: "Peter Drucker",
            tags: ["shadow"],
            metadata: { addedAt: new Date().toISOString(), verified: true },
        };

        test("initializes with personal quotes and shadows system ones", () => {
            const store = init({
                quotes: mockQuotes,
                personalQuotes: [personalQuote, shadowQuote],
            });

            // shadowQuote overrides mockQuotes[0]
            expect(store.get(mockQuotes[0].id)?.text).toBe("Shadowed text");
            expect(store.get("personal-1")?.text).toBe("My personal quote");

            // Total count should be system (2) + personal non-shadowing (1) = 3
            expect(store.count()).toBe(3);
        });

        test('random("personal") returns only personal', () => {
            const store = init({
                quotes: mockQuotes,
                personalQuotes: [personalQuote],
            });
            const result = store.random("personal");
            expect(result.id).toBe("personal-1");
        });

        test('random("all") returns from merged pool', () => {
            const store = init({
                quotes: mockQuotes,
                personalQuotes: [personalQuote],
            });
            const results = store.random(10, "all");
            expect(results).toHaveLength(3);
            expect(results.map((r) => r.id)).toContain("personal-1");
            expect(results.map((r) => r.id)).toContain(mockQuotes[0].id);
        });

        test("addPersonalQuote updates all structures and shadows", () => {
            const store = init({ quotes: mockQuotes });
            store.addPersonalQuote(shadowQuote);

            expect(store.get(mockQuotes[0].id)?.text).toBe("Shadowed text");
            expect(store.count()).toBe(2); // Still 2 because it shadowed

            const personalResults = store.random(1, "personal");
            expect(personalResults[0].text).toBe("Shadowed text");
        });
    });
});
