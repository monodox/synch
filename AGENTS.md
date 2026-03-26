# AGENTS.md

## Project overview

Synch is a lightweight, open-source Node.js execution runtime that reduces cost and improves performance by reusing computation and maintaining state. It is written in TypeScript, targets Node.js >= 16, and compiles with `tsc` to CommonJS.

## Architecture

- `src/index.ts` — Public entry point, re-exports all public APIs
- `src/createSynch.ts` — Factory function wiring Cache, State, Router, and Runner
- `src/cache/cache.ts` — In-memory cache with TTL, max size, FIFO eviction
- `src/memory/state.ts` — Key-value state store with timestamps
- `src/router/router.ts` — Input validation, ID generation, metadata enrichment
- `src/runtime/runner.ts` — Task executor with caching, concurrency limits, timeouts
- `src/cli/cli.ts` — CLI interface for running tasks from the terminal
- `src/web/server.ts` — HTTP server with /run, /stats, /health endpoints
- `src/bin.ts` — Entry point for CLI and server modes
- `src/types/index.ts` — All shared TypeScript interfaces and types

## Dev environment tips

- Run `npm install` to install dependencies.
- Run `npm run build` to compile TypeScript. Output goes to `dist/`.
- Run `npm test` to run the test suite with vitest.
- There are no external runtime dependencies — only devDependencies.
- The project uses strict TypeScript (`strict: true` in tsconfig.json).
- Target is ES2020 with CommonJS modules.
- When adding new modules, export them through `src/index.ts`.
- Configuration types live in `src/types/index.ts` — extend interfaces there, not inline.

## Testing instructions

- Tests live in the `test/` directory, one file per module.
- Run `npm test` to execute all tests (uses vitest with `--run` flag).
- After moving files or changing imports, run `npm run build` to catch broken references.
- Add or update tests for any code you change.

## Code style

- Use TypeScript strict mode — no `any` unless absolutely necessary.
- Prefer explicit return types on public methods.
- Use JSDoc comments (`/** */`) on all public classes and methods.
- Keep modules focused — each file in its own directory under `src/`.
- Configuration interfaces use optional properties with defaults applied via `??` in constructors.

## PR instructions

- Title format: `[module] description` (e.g., `[cache] Add LRU eviction strategy`)
- Run `npm run build` and `npm test` before committing.
- Do not commit `dist/`, `node_modules/`, or `.idea/` — they are gitignored.
- Keep changes focused. One feature or fix per PR.
