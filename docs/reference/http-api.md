# REST API Reference

The API is hosted on Cloudflare Workers.

## Base URL

\`https://api.qquotes.dev\` (example)

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/quotes` | List quotes with pagination and filtering |
| GET | `/quotes/random` | Get random quote(s) |
| GET | `/quotes/{id}` | Get quote by ID |
| GET | `/authors` | List all authors |
| GET | `/tags` | List all tags |
| GET | `/stats` | Get collection statistics |

## OpenAPI Spec

```yaml
# OpenAPI 3.1 specification (excerpt)

paths:
  /quotes:
    get:
      summary: List quotes with pagination and filtering
      parameters:
        - name: limit
          in: query
          schema: { type: integer, default: 20, maximum: 100 }
        - name: offset
          in: query
          schema: { type: integer, default: 0 }
        - name: author
          in: query
          schema: { type: string }
        - name: tag
          in: query
          schema: { type: string }
        - name: tags
          in: query
          schema: { type: array, items: { type: string } }
        - name: tags_mode
          in: query
          schema: { type: string, enum: [all, any], default: any }
        - name: q
          in: query
          description: Full-text search
          schema: { type: string }
```

## Middleware & Limits

### Rate Limiting
- **Standard**: 100 requests / minute per IP.
- **Headers**:
    - `X-RateLimit-Limit`
    - `X-RateLimit-Remaining`
    - `X-RateLimit-Reset`

### CORS
Allowed from all origins (`*`) for `GET` and `OPTIONS` requests.
