import { bench, group, run } from "mitata";
import quotes from "../../../data/src/quotes.json";
import { QuoteSchema } from "../schema";
import { qquotes } from "../store";

const validatedQuotes = quotes.map((q) => QuoteSchema.parse(q));
const q = new qquotes({ quotes: validatedQuotes });

group("retrieval", () => {
    bench("random()", () => {
        q.random();
    });

    bench("get()", () => {
        q.get(validatedQuotes[0].id);
    });
});

group("filtering", () => {
    bench("byAuthor()", () => {
        q.byAuthor("Peter Drucker");
    });

    bench("byTag()", () => {
        q.byTag("motivation");
    });
});

group("search", () => {
    bench('search("future")', () => {
        q.search("future");
    });
});

await run();
