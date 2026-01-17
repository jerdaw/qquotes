# ADR: CLI Fetch and Persistence

## Context
The user requested the ability to pull quotes from the CLI (e.g., as part of a fetch program) and have it work both online and offline.

## Decision
1. **Local Storage**: Use a local JSON file stored in the user's config directory (following XDG standards: `~/.config/qquotes/quotes.json`).
2. **Fetch Command**: Implement a `fetch` command that retrieves a quote from a URL and saves it to the local storage.
3. **Async I/O**: Use asynchronous file operations to ensure the CLI remains responsive.
4. **Validation**: Use Zod schemas to validate fetched data before persistence.
5. **Deduplication**: Prevent redundant entries based on quote text.

## Consequence
- The CLI can now act as a dynamic quote manager.
- Users can bootstrap their personal quote library from external sources.
- The `random` and `list` commands were updated with a `--mode` flag to allow slicing the collection between 'system' and 'personal' quotes.
