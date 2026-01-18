# Contributing to qquotes

We welcome contributions! Please follow the guidelines below to ensure a smooth workflow.

## Development Workflow

### Prerequisites

-   **Bun** (Latest v1.x)
-   **pnpm** (v9.x)

### Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/your-org/qquotes
    cd qquotes
    ```

2. Install dependencies:

    ```bash
    pnpm install
    ```

3. Build all packages:

    ```bash
    pnpm build
    ```

4. Run tests:
    ```bash
    pnpm test
    ```

### Project Structure

-   `packages/core`: Core logic. **No data** should be bundled here.
-   `packages/data`: Raw strings and generated indexes.
-   `packages/api`: The public REST API.
-   `packages/cli`: The command line interface.

### Scripts

Run these from the root:

-   `pnpm build`: Build all packages (uses Turbo)
-   `pnpm test`: Run tests (uses Bun test)
-   `pnpm lint`: Lint codebase (uses Biome)
-   `pnpm lint:fix`: Fix linting errors
-   `pnpm typecheck`: Run TypeScript type checking
-   `pnpm bench`: Run benchmarks

### Git Hooks

We use `lefthook` for git hooks.

-   **Pre-commit**: Runs linting, typechecking, and quote validation.
-   **Pre-push**: Runs tests.

### Adding Quotes

To add a quote, edit `packages/data/src/quotes.json`.
The format must match the schema defined in `packages/core/src/schema.ts`.

Run validation before committing:

```bash
pnpm --filter @qquotes/core validate
```
