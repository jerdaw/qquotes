# Architecture Overview

## Executive Summary

qquotes is a ground-up reimagining of the [dwyl/quotes](https://github.com/dwyl/quotes) project, designed with modern tooling, type safety, and performance as core principles. It provides a curated collection of inspiring quotations accessible via multiple distribution channels: npm package, REST API, and CLI tool.

## Goals

### Primary Goals

1. **Speed**: Sub-millisecond quote retrieval with pre-built indexes
2. **Type Safety**: Full TypeScript with strict mode, zod validation, generated types
3. **Reliability**: 100% test coverage on core logic, comprehensive CI/CD
4. **Modern DX**: Tree-shakeable ESM, excellent IDE support, minimal dependencies
5. **Multi-platform**: npm package, REST API, CLI, potential future Rust/WASM core
6. **Personalization**: User-managed personal quote repository with Git-based synchronization support.

### Non-Goals

-   Real-time collaborative editing of quotes
-   Quote submission through the API to the _global_ database (personal curation only)
-   Mobile native SDKs (web-first approach)
