# AGENTS.md

## Project overview

Synch is a TypeScript library providing an AI task execution runtime with computation reuse, state management, and intelligent caching. It targets Node.js >= 16 and compiles with `tsc` to CommonJS.

## Architecture

- `src/index.ts` — Public entry point, re-exports `createSynch`
- `src/createSynch.ts` — Factory function wiring Cache, State, Router, and Runner
- `src/cache/cache.ts` — In-memory cache with TTL, max size, FIFO eviction
- `src/memory/state.ts` — Key-value state store with timestamps
- `src/router/router.ts` — Input validation, ID generation, metadata enrichment
- `src/runtime/runner.ts` — Task executor with caching, concurrency limits, timeouts
- `src/types/index.ts` — All shared TypeScript interfaces and types

## Dev environment tips

- Run `npm install` to install dependencies.
- Run `npm run build` to compile TypeScript. Output goes to `dist/`.
- There are no external runtime dependencies — only `typescript` as a devDependency.
- The project uses strict TypeScript (`strict: true` in tsconfig.json).
- Target is ES2020 with CommonJS modules.
- When adding new modules, export them through `src/index.ts`.
- Configuration types live in `src/types/index.ts` — extend interfaces there, not inline.

## Testing instructions

- Tests are not yet set up. If adding tests, use a framework compatible with TypeScript (e.g., vitest or jest with ts-jest).
- Always run `npm run build` to verify the project compiles cleanly before committing.
- Check `examples/basic.ts` to understand expected usage patterns.
- After moving files or changing imports, run `npm run build` to catch any broken references.

## Code style

- Use TypeScript strict mode — no `any` unless absolutely necessary.
- Prefer explicit return types on public methods.
- Use JSDoc comments (`/** */`) on all public classes and methods.
- Keep modules focused — each file in its own directory under `src/`.
- Configuration interfaces use optional properties with defaults applied via `??` in constructors.

## PR instructions

- Title format: `[module] description` (e.g., `[cache] Add LRU eviction strategy`)
- Run `npm run build` before committing — the project must compile without errors.
- Do not commit `dist/`, `node_modules/`, or `.idea/` — they are gitignored.
- Keep changes focused. One feature or fix per PR.
