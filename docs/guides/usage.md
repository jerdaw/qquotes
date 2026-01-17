# Usage

## Core Library

```typescript
import { QQuotes } from '@qquotes/core';

// Initialize the library
// (Data is lazy-loaded or pre-loaded depending on config)
const quotes = new QQuotes();

// Get a random quote
const quote = quotes.random();
console.log(quote.text);
// Output: "The best way to predict your future is to create it."

// Get quote by ID
const specific = quotes.get('550e8400-e29b-41d4-a716-446655440000');

// Search for quotes
// Uses the pre-built inverted index for fast O(log N) lookups
const results = quotes.search('future');
console.log(`Found ${results.length} quotes about future`);
```

## Functional API

For better tree-shaking, you can use the functional API:

```typescript
import { random, search } from '@qquotes/core';

console.log(random().text);
```

## Using the API

You can fetch quotes directly from our edge API:

```bash
curl https://api.qquotes.dev/quotes/random
```

Response:

```json
{
  "id": "...",
  "text": "...",
  "author": "...",
  "tags": ["..."]
}
```json
{
  "id": "...",
  "text": "...",
  "author": "...",
  "tags": ["..."]
}
```

## CLI Usage

The QQuotes CLI provides a powerful way to interact with your collection directly from the terminal.

### Fetching New Quotes

You can expand your local collection by fetching quotes from any compatible JSON API:

```bash
qquotes fetch https://dummyjson.com/quotes/random
```

Fetched quotes are stored locally in `~/.config/qquotes/quotes.json` and are available even when you are offline.

### Mixing Personal and System Quotes

Use the `--mode` flag to control which quotes are displayed:

```bash
# Only from the default system library
qquotes random --mode system

# Only from quotes you've fetched or added
qquotes random --mode personal

# An even mix of both
qquotes random --mode mixed
```
