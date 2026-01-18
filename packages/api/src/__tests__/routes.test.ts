import { describe, expect, test } from "bun:test";
import app from "../index";

describe("API Integration Tests", () => {
    test("GET / returns 200 and links to docs", async () => {
        const res = await app.request("/");
        expect(res.status).toBe(200);
        // biome-ignore lint/suspicious/noExplicitAny: Test helper
        const json = (await res.json()) as any;
        expect(json.docs).toBe("/doc");
    });

    test("GET /quotes returns paginated results", async () => {
        const res = await app.request("/quotes?limit=1");
        expect(res.status).toBe(200);
        // biome-ignore lint/suspicious/noExplicitAny: Test helper
        const json = (await res.json()) as any;
        expect(json.data).toHaveLength(1);
        expect(json.meta.total).toBeGreaterThan(0);
    });

    test("GET /quotes/random returns a quote", async () => {
        const res = await app.request("/quotes/random");
        expect(res.status).toBe(200);
        // biome-ignore lint/suspicious/noExplicitAny: Test helper
        const json = (await res.json()) as any;
        expect(json).toHaveProperty("id");
        expect(json).toHaveProperty("text");
    });

    test("GET /authors returns list of authors", async () => {
        const res = await app.request("/authors");
        expect(res.status).toBe(200);
        // biome-ignore lint/suspicious/noExplicitAny: Test helper
        const json = (await res.json()) as any;
        expect(Array.isArray(json)).toBe(true);
        if (json.length > 0) {
            expect(json[0]).toHaveProperty("name");
            expect(json[0]).toHaveProperty("count");
        }
    });

    test("GET /doc returns Scalar UI", async () => {
        const res = await app.request("/doc");
        expect(res.status).toBe(200);
        const text = await res.text();
        expect(text).toContain("scalar");
    });

    test("GET /openapi.json returns OpenAPI spec", async () => {
        const res = await app.request("/openapi.json");
        if (res.status !== 200) {
            const debug = await app.request("/debug-openapi");
            const error = await debug.json();
            console.error(
                "OpenAPI Generation Error:",
                JSON.stringify(error, null, 2),
            );
        }
        expect(res.status).toBe(200);
        // biome-ignore lint/suspicious/noExplicitAny: Test helper
        const json = (await res.json()) as any;
        expect(json.openapi).toBe("3.1.0");
        expect(json.info.title).toBe("qquotes API");
    });
});
