import { describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cliPath = resolve(__dirname, "../index.ts");

describe("qquotes CLI E2E", () => {
    const run = (args: string[]) => {
        return spawnSync("bun", [cliPath, ...args], {
            encoding: "utf8",
        });
    };

    it("should show a random quote on default", () => {
        const { stdout, status } = run([]);
        expect(status).toBe(0);
        expect(stdout).toContain("—"); // All formatted quotes have an em-dash for author
    });

    it("should show help", () => {
        const { stdout, status } = run(["--help"]);
        expect(status).toBe(0);
        expect(stdout).toContain("Usage: qquotes");
        expect(stdout).toContain("Options:");
    });

    it("should run the random command", () => {
        const { stdout, status } = run(["random"]);
        expect(status).toBe(0);
        expect(stdout).toBeDefined();
    });

    it("should support searching", () => {
        const res = run(["search", "the"]);
        expect(res.status).toBe(0);
        expect(res.stdout).toContain("—");
    });

    it("should show stats", () => {
        const { stdout, status } = run(["stats"]);
        expect(status).toBe(0);
        expect(stdout).toContain("Total Quotes");
    });
});
