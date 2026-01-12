# CLI Reference

## Installation

```bash
npm install -g @qquotes/cli
# or
bunx @qquotes/cli
```

## Commands

| Command | Description | Example |
|---------|-------------|---------|
| `qquotes` | Get a random quote | `qquotes` |
| `qquotes random` | Get random quote(s) | `qquotes random -n 5` |
| `qquotes search` | Search quotes | `qquotes search "future"` |
| `qquotes list` | List quotes (paginated) | `qquotes list -t inspiration` |
| `qquotes authors` | List all authors | `qquotes authors` |
| `qquotes tags` | List all tags | `qquotes tags` |
| `qquotes stats` | Show collection stats | `qquotes stats` |

## Options

- `-f, --format <format>`: Output format (`json`, `text`, `markdown`).
- `-n, --count <number>`: Number of quotes to return.
- `-t, --tag <tag>`: Filter by tag.
- `-a, --author <author>`: Filter by author.
- `--motd`: "Quote of the day" (deterministic based on date).
