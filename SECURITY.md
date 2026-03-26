# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 1.x     | Yes       |
| < 1.0   | No        |

## Reporting a vulnerability

Do not open a public GitHub issue for security vulnerabilities.

Report vulnerabilities through [GitHub Security Advisories](https://github.com/monodox/synch/security/advisories/new) or by emailing the maintainers directly.

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Affected versions
- Suggested fix or workaround (if known)

## Response timeline

- Acknowledgment within 48 hours
- Initial assessment within 5 business days
- Status updates every 7 days until resolved
- Coordinated disclosure after a fix is released

## Security considerations when using Synch

- **Input validation**: always validate and sanitize inputs before passing them to `synch.run()`
- **Cache sensitivity**: avoid caching responses that contain secrets or user-specific sensitive data
- **Concurrency limits**: configure `maxConcurrency` to prevent resource exhaustion
- **Timeouts**: set appropriate `timeout` values to avoid hanging tasks
- **Environment variables**: use `.env` files for sensitive configuration, never commit `.env.local`
- **Web mode**: if exposing the HTTP server publicly, add authentication and rate limiting in front of it
