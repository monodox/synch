# Synch

A lightweight, open-source Node.js execution runtime that reduces cost and improves performance by reusing computation and maintaining state.

Modern AI systems repeatedly recompute the same results, wasting compute, memory, and money. Synch introduces a structured execution pipeline that caches results, maintains state, and only computes what is strictly necessary.

## Features

- **Computation reuse** — cache and retrieve results to skip redundant work
- **State management** — persist execution context across requests
- **Concurrency control** — configurable limits with timeout enforcement
- **CLI mode** — run tasks from the terminal with JSON input
- **Web mode** — lightweight HTTP API with `/run`, `/stats`, and `/health` endpoints
- **Zero runtime dependencies** — only TypeScript as a dev dependency

## Installation

```bash
npm install synch
```

Requires Node.js >= 16.

## Quick start

### As a library

```typescript
import { createSynch } from 'synch';

const synch = createSynch({
  cache: { maxSize: 100, ttl: 60000 },
  runtime: { maxConcurrency: 5, timeout: 10000 },
});

// Define your task
const classify = async (text: string): Promise<string> => {
  // Your AI inference, API call, or computation here
  const response = await fetch('https://api.example.com/classify', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  return response.json();
};

// First call computes the result
const result1 = await synch.run({ input: 'hello world' }, classify);
console.log(result1.output);  // classification result
console.log(result1.cached);  // false

// Second call with same input returns cached result instantly
const result2 = await synch.run({ input: 'hello world' }, classify);
console.log(result2.cached);  // true
console.log(result2.executionTime);  // ~0ms
```

### CLI mode

```bash
# Build first
npm run build

# Run with inline JSON
npx synch run --input '{"input": "hello world"}'

# Run from a file
npx synch run --file input.json

# Pipe from stdin
echo '{"input": "hello world"}' | npx synch run

# View stats
npx synch stats
```

### Web server mode

```bash
# Start the server (default port 3000)
npx synch serve

# Custom port
npx synch serve --port 8080
```

Endpoints:

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/run` | Execute a task with JSON body `{ "input": ... }` |
| `GET` | `/stats` | Cache hits, misses, execution count |
| `GET` | `/health` | Health check |

```bash
# Execute a task
curl -X POST http://localhost:3000/run \
  -H 'Content-Type: application/json' \
  -d '{"input": "hello world"}'

# Check stats
curl http://localhost:3000/stats
```

## Configuration

All configuration is optional. Defaults are applied automatically.

```typescript
const synch = createSynch({
  cache: {
    enabled: true,       // enable/disable caching (default: true)
    maxSize: 1000,       // max cached entries (default: 1000)
    ttl: 3600000,        // time-to-live in ms (default: 1 hour, 0 = never expire)
  },
  router: {
    enabled: true,       // enable/disable routing (default: true)
  },
  runtime: {
    maxConcurrency: 10,  // max parallel executions (default: 10)
    timeout: 30000,      // task timeout in ms (default: 30s)
  },
});
```

Environment variables can also be used (see [`.env.example`](.env.example)).

## API

### `createSynch(config?): Synch`

Creates a new Synch instance.

### `synch.run(input, task): Promise<SynchOutput>`

Executes a task through the pipeline. Checks cache first, runs the task if no cache hit, stores the result.

- `input` — `{ input: T, id?: string, metadata?: Record<string, any> }`
- `task` — `(input: T) => Promise<O> | O`
- Returns `{ output: O, cached: boolean, executionTime: number, timestamp: number }`

### `synch.clearCache(): void`

Clears all cached results and resets hit/miss counters.

### `synch.getStats(): SynchStats`

Returns `{ cacheHits, cacheMisses, totalExecutions, cacheSize }`.

## Architecture

```
┌─────────────────────────────────────────────┐
│                  createSynch                │
│                                             │
│  ┌──────────┐  ┌────────┐  ┌────────────┐  │
│  │  Router   │→│ Runner  │→│   Cache     │  │
│  │ validate  │  │execute │  │ get/set    │  │
│  │ route     │  │timeout │  │ TTL/evict  │  │
│  └──────────┘  └───┬────┘  └────────────┘  │
│                     │                       │
│                ┌────┴────┐                  │
│                │  State   │                  │
│                │ persist  │                  │
│                └─────────┘                  │
└─────────────────────────────────────────────┘
```

- **Router** — validates input, generates IDs, enriches metadata
- **Runner** — executes tasks with concurrency limits and timeouts
- **Cache** — in-memory store with TTL expiration and FIFO eviction
- **State** — key-value store for persisting execution context

## Project structure

```
src/
├── index.ts              # Public exports
├── createSynch.ts        # Factory function
├── bin.ts                # CLI/server entry point
├── types/index.ts        # TypeScript interfaces
├── cache/cache.ts        # Cache module
├── memory/state.ts       # State module
├── router/router.ts      # Router module
├── runtime/runner.ts     # Runner module
├── cli/cli.ts            # CLI mode
└── web/server.ts         # Web server mode
test/
├── cache.test.ts
├── state.test.ts
├── router.test.ts
├── runner.test.ts
├── createSynch.test.ts
├── cli.test.ts
└── server.test.ts
```

## Development

```bash
git clone https://github.com/monodox/synch.git
cd synch
npm install
npm run build
npm test
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

[MIT](LICENSE)
