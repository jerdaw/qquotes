export * from "./schema";
export * from "./store";
export * from "./search";
export * from "./types";
export * from "./random";
export * from "./query";

import { qquotes } from "./store";
import type { qquotesOptions } from "./types";

let instance: qquotes | null = null;

export function init(options: qquotesOptions) {
    instance = new qquotes(options);
    return instance;
}

export function getInstance() {
    if (!instance) {
        throw new Error("qquotes not initialized. Call init() first.");
    }
    return instance;
}
