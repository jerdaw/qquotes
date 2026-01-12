# Performance

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| `random()` latency | < 0.1ms | Bun bench |
| `byTag()` latency | < 0.5ms | Bun bench |
| `search()` latency | < 5ms for 10k quotes | Bun bench |
| Bundle size (core) | < 5KB gzipped (code only) | size-limit |
| Bundle size (with data) | < 100KB gzipped | size-limit |
| API cold start | < 50ms | Cloudflare Workers |
| API p99 latency | < 20ms | Cloudflare Analytics |
| Time to first quote (CLI) | < 100ms | hyperfine |

## Performance Strategies

1. **Pre-built indexes**: Generate author/tag indexes at build time
2. **Inverted index for search**: Tokenize quotes at build time for O(log N) search instead of O(N) linear scan
3. **Separate data package**: `@qquotes/core` (5KB) contains logic only; `@qquotes/data` (100KB) is optional
4. **Lazy loading**: Load full data only when needed (CLI/API fetch data at runtime)
5. **Binary search**: Sorted arrays for range queries
6. **Fuzzy matching**: Bigram-based matching for author/tag lookups with typos
7. **Streaming**: API supports streaming for large result sets
8. **Edge caching**: Cloudflare edge caching for API responses
