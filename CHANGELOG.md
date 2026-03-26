# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-26

### Added

- Core execution pipeline with `createSynch()` factory function
- In-memory cache with TTL expiration, max size limits, and FIFO eviction
- State management for persisting execution context across requests
- Runtime executor with configurable concurrency limits and task timeouts
- Request router with input validation, ID generation, and metadata enrichment
- CLI mode with support for inline JSON, file input, and stdin piping
- Web server mode with `POST /run`, `GET /stats`, and `GET /health` endpoints
- CORS support in web server
- Full TypeScript type definitions
- Test suite with vitest covering all modules (65 tests)
- AGENTS.md for AI coding agent guidance
- GitHub Actions workflows for CodeQL, dependency review, npm publishing, and more
