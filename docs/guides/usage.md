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
```
