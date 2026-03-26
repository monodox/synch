# Contributing to Synch

Thanks for your interest in contributing. This guide covers everything you need to get started.

## Prerequisites

- Node.js >= 16
- npm

## Setup

```bash
git clone https://github.com/monodox/synch.git
cd synch
npm install
```

## Development workflow

```bash
# Build the project
npm run build

# Run tests
npm test

# Watch mode for TypeScript compilation
npm run dev
```

## Making changes

1. Fork the repository and create a branch from `main`.
2. Make your changes in the `src/` directory.
3. Add or update tests in the `test/` directory for any new or changed behavior.
4. Run `npm run build` to verify the project compiles without errors.
5. Run `npm test` to verify all tests pass.
6. Commit with a clear message describing the change.

## Code style

- TypeScript strict mode is enforced. Avoid `any` unless absolutely necessary.
- Use explicit return types on public methods.
- Add JSDoc comments (`/** */`) on all public classes and methods.
- Keep modules focused — one responsibility per file.
- Configuration interfaces use optional properties with defaults applied via `??`.

## Project structure

- `src/types/index.ts` — all shared interfaces and types go here
- `src/index.ts` — public exports; add new modules here
- `test/` — test files, one per module, named `<module>.test.ts`

## Pull requests

- Title format: `[module] description` (e.g., `[cache] Add LRU eviction strategy`)
- Keep PRs focused on a single change.
- Include a description of what changed and why.
- Ensure `npm run build` and `npm test` both pass.
- Do not commit `dist/`, `node_modules/`, or `.idea/`.

## Reporting issues

Open an issue on [GitHub](https://github.com/monodox/synch/issues) with:

- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Node.js version and OS

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
