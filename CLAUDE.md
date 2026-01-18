# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

qquotes is a modern, fast, and reliable quotes library and API. It provides quote management through multiple distribution channels: npm package, REST API, interactive CLI, and documentation website. The project emphasizes type safety (strict TypeScript), performance (sub-millisecond quote retrieval), and comprehensive testing (100% coverage target).

## Project Structure

### Monorepo Layout (pnpm workspaces + Turbo)

```
packages/
├── core/         # Core logic: indexing, searching, validation (5KB limit)
├── data/         # Quote data: raw JSON + generated indexes
├── api/          # REST API on Cloudflare Workers (Hono)
└── cli/          # Interactive CLI (Commander + Inquirer)

apps/
└── web/          # Documentation site (Next.js + MDX)

docs/             # MkDocs documentation
tools/            # Build scripts (indexing, validation)
```

### Key Architectural Decisions

**Data Separation**: `@qquotes/core` is a pure logic library with NO bundled data. It takes quotes as options and maintains 4 parallel indexes:

-   `idMap`: Quote ID → Quote object (O(1) lookup)
-   `authorMap`: Author → Set of quote IDs (case-insensitive)
-   `tagMap`: Tag → Set of quote IDs
-   `searchEngine`: MinSearch-powered full-text search

**Quote Shadowing**: Personal quotes (per user) can override system quotes by matching ID. The store merges both lists with personal taking priority (qquotes store constructor, line 19-23).

**Pre-built Indexes**: `@qquotes/data/generated/` contains JSON indexes:

-   `quotes.min.json`: Minified quote data
-   `index.by-author.json`, `index.by-tag.json`: Quick lookups
-   `search-index.json`: MinSearch serialized index
-   `stats.json`: Aggregate statistics

## Build, Test, and Lint

### Common Commands

```bash
# Install dependencies (pnpm v9+, Bun v1+)
pnpm install

# Build all packages (Turbo caching)
pnpm build

# Run all tests (Bun test runner, 100% coverage target)
pnpm test

# Run tests with coverage report
pnpm test -- --coverage

# Lint with Biome (single, unified linter + formatter)
pnpm lint

# Fix linting/formatting issues
pnpm lint:fix

# Type checking across all packages
pnpm typecheck

# Run performance benchmarks
pnpm bench

# Run specific package commands
pnpm --filter @qquotes/core build
pnpm --filter @qquotes/api dev          # Run API locally (Wrangler)
pnpm --filter @qquotes/cli test         # Run CLI tests only

# Serve documentation locally (http://localhost:8000)
npm run docs:serve

# Release (builds + publishes via changesets)
pnpm release
```

### Single Package Testing

```bash
# Test specific package
pnpm --filter @qquotes/core test

# Run a single test file with Bun
bun test packages/core/src/__tests__/search.test.ts

# Watch mode (Bun auto-reload)
bun test packages/core/src/__tests__/search.test.ts --watch

# Run tests matching a pattern
bun test --filter "search" packages/core/src/__tests__/
```

## Testing Structure

Tests use **Bun's built-in test runner** (no external framework). Located in `__tests__` directories:

-   **Property-based tests** (`property.test.ts`): Fast-check for randomized validation
-   **Concurrency tests** (`concurrency.test.ts`): Multi-threaded quote operations
-   **Performance tests** (`perf.test.ts`): Latency benchmarks
-   **Functional tests** (`search.test.ts`, `store.test.ts`): Core logic validation
-   **API tests** (`routes.test.ts`, `ratelimit.test.ts`): HTTP endpoint validation
-   **Data integrity** (`integrity.test.ts`): Quote schema + index consistency

100% type coverage is enforced (`type-coverage --strict`), tracked in CI.

## Development Workflow

### Pre-commit Hooks

Git hooks via **lefthook** (in `.lefthook.yml`):

-   Linting and type checking on staged changes
-   Quote validation when `packages/data/src/quotes.json` is modified

```bash
# Pre-commit runs automatically
# To run manually:
pnpm lint && pnpm typecheck && pnpm --filter @qquotes/data validate
```

### Adding Quotes

Edit `packages/data/src/quotes.json` directly. Schema is defined in `packages/core/src/schema.ts`:

```typescript
{
  "id": "uuid-v4",
  "text": "Quote text (max 500 chars)",
  "author": "Author name",
  "source": "https://...", // optional
  "tags": ["tag1", "tag2"],
  "metadata": {
    "addedAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp (optional)",
    "contributor": "GitHub username (optional)",
    "verified": true
  }
}
```

Validation runs automatically on commit; manually trigger with:

```bash
pnpm --filter @qquotes/data validate
```

### Building Data Indexes

Indexes are generated during `pnpm build` via `packages/data/tools/build-indexes.ts`. They power fast lookups and are committed to the repo for offline use. Regenerate manually:

```bash
pnpm --filter @qquotes/data build
```

## Code Quality Standards

### Linting & Formatting

**Biome** handles both linting and formatting (single tool, no Prettier):

-   100-character line width
-   Single quotes, always semicolons
-   Organized imports (automatic)
-   Recommended rules enabled

Configuration: `biome.json`

### Type Safety

-   **TypeScript strict mode** enabled globally
-   **Zod schemas** for runtime validation (Quote, API requests, responses)
-   **100% type coverage** enforced on core library
-   **ESLint** for web app (Next.js specific rules)

### Bundle Size Limits

Core library has a **5 KB limit** (gzipped), enforced in CI via `size-limit`. Check before committing:

```bash
pnpm --filter @qquotes/core size-limit
```

## CI/CD Pipeline

**GitHub Actions** (`.github/workflows/ci.yml`):

1. **Lint**: Biome check, TypeScript strict mode
2. **Test**: Full test suite with codecov upload
3. **Build**: All packages, size-limit check
4. **Bench**: Performance benchmarks (tracked in PR)

All jobs run on Ubuntu (Bun + pnpm preinstalled).

## Key Dependencies

### Core Library (@qquotes/core)

-   **Zod** (3.23.8): Runtime schema validation
-   **MinSearch** (7.x): Full-text search engine (3 KB, great for quotes)

### API (@qquotes/api)

-   **Hono** (4.x): Lightweight web framework (Cloudflare Workers compatible)
-   **Hono Zod OpenAPI**: Automatic OpenAPI spec generation from routes
-   **Hono Rate Limiter**: Built-in rate limiting
-   **Hono Pino**: Structured logging

### CLI (@qquotes/cli)

-   **Commander**: Command parsing
-   **Inquirer**: Interactive prompts

### Web (@apps/web)

-   **Next.js** (16.x): React framework with static generation
-   **Tailwind CSS**: Styling
-   **next-mdx-remote**: MDX content rendering

## Important Files & Patterns

### Core Store Implementation (packages/core/src/store.ts)

The `qquotes` class is the main entry point. Key patterns:

-   Constructor takes optional `quotes`, `personalQuotes`, and pre-built `indexes`
-   Personal quotes override system quotes (by ID)
-   All indexes are case-sensitive except `authorMap` (normalized to lowercase)
-   Search returns full Quote objects, not just IDs

### API Routes (packages/api/src/routes/)

Routes are organized by feature and use **Hono ZodOpenAPI** for type-safe route definitions:

-   Each route file exports a `createRoute()` function
-   Zod schemas define inputs and outputs (auto-documented)
-   Rate limiting applied per-endpoint
-   Personal quote routes return shadow/original quote metadata

### CLI Config (packages/cli/src/config.ts)

User preferences stored in `~/.config/qquotes/config.json`. The CLI can persist:

-   Favorite authors/tags
-   Search filters
-   Personal quote lists (with Git sync support planned)

## Performance Considerations

-   **Quote lookup**: O(1) via ID, O(n) for author/tag filtering
-   **Search**: O(log n) via MinSearch, with fuzzy matching cost
-   **Random selection**: O(1) with cached lookup
-   **Bundle size**: Strict 5 KB limit on core, no tree-shakeable exports avoided
-   **Memory**: All quotes loaded in-memory; suitable for ~50K quotes (current: ~1K)

Pre-built indexes in `@qquotes/data` enable fast initialization without runtime index building.

## Deployment

### API (Cloudflare Workers)

```bash
pnpm --filter @qquotes/api dev    # Local dev with Wrangler
pnpm --filter @qquotes/api deploy # Deploy to Cloudflare
```

Configuration: `packages/api/wrangler.toml`

### Web (Next.js Static Export)

```bash
pnpm --filter web build && pnpm --filter web start
```

### Documentation (MkDocs)

```bash
npm run docs:serve   # http://localhost:8000
npm run docs:build   # Static output in site/
```

## Release Process

Uses **Changesets** for semantic versioning and changelog management:

```bash
# Create a changeset (prompts for affected packages + semver bump)
pnpm changeset

# Review changes
git diff .changeset/

# Publish (builds + pushes to npm)
pnpm release
```

Publishes to npm:

-   `@qquotes/core` (main library)
-   `@qquotes/cli` (executable)
-   `@qquotes/data` (data package, optional peer)

## Critical Rules

1. **Never bundle quote data in @qquotes/core** — it's logic-only for tree-shaking
2. **Always run `pnpm lint:fix` before committing** — pre-commit hooks enforce this
3. **Update tests when changing core logic** — 100% coverage is a quality standard
4. **Validate quotes before committing** — schema validation is automatic but test manually
5. **Check bundle size for core changes** — `pnpm --filter @qquotes/core size-limit`
6. **Use Zod for validation** — all external inputs (API, CLI) must be validated
7. **Maintain case-sensitive indexes except authorMap** — this is by design, don't change
