import { describe, it, expect, afterEach } from 'vitest';
import { SynchServer } from '../src/web/server';
import * as http from 'http';

let portCounter = 19870;
function nextPort(): number {
  return portCounter++;
}

function request(
  method: string,
  path: string,
  port: number,
  body?: string
): Promise<{ status: number; data: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { method, path, port, hostname: '127.0.0.1', headers: { 'Content-Type': 'application/json' } },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => { raw += chunk; });
        res.on('end', () => {
          resolve({ status: res.statusCode ?? 0, data: JSON.parse(raw) });
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

describe('SynchServer', () => {
  let server: SynchServer;

  afterEach(async () => {
    if (server) await server.stop();
  });

  it('should respond to GET /health', async () => {
    const port = nextPort();
    server = new SynchServer({}, { port });
    await server.start();
    const res = await request('GET', '/health', port);
    expect(res.status).toBe(200);
    expect(res.data.status).toBe('ok');
  });

  it('should respond to GET /stats', async () => {
    const port = nextPort();
    server = new SynchServer({}, { port });
    await server.start();
    const res = await request('GET', '/stats', port);
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('cacheHits');
    expect(res.data).toHaveProperty('cacheMisses');
  });

  it('should execute task via POST /run', async () => {
    const port = nextPort();
    server = new SynchServer({}, { port });
    await server.start();
    const res = await request('POST', '/run', port, JSON.stringify({ input: 'hello' }));
    expect(res.status).toBe(200);
    expect(res.data.output).toBe('hello');
    expect(res.data.cached).toBe(false);
  });

  it('should return cached result on duplicate POST /run', async () => {
    const port = nextPort();
    server = new SynchServer({}, { port });
    await server.start();
    await request('POST', '/run', port, JSON.stringify({ input: 'hello' }));
    const res = await request('POST', '/run', port, JSON.stringify({ input: 'hello' }));
    expect(res.data.cached).toBe(true);
  });

  it('should return 400 for invalid JSON', async () => {
    const port = nextPort();
    server = new SynchServer({}, { port });
    await server.start();
    const res = await request('POST', '/run', port, 'not json');
    expect(res.status).toBe(400);
    expect(res.data.error).toBe('Invalid JSON');
  });

  it('should return 400 for empty body', async () => {
    const port = nextPort();
    server = new SynchServer({}, { port });
    await server.start();
    const res = await request('POST', '/run', port);
    expect(res.status).toBe(400);
    expect(res.data.error).toBe('Request body is required');
  });

  it('should return 404 for unknown routes', async () => {
    const port = nextPort();
    server = new SynchServer({}, { port });
    await server.start();
    const res = await request('GET', '/nope', port);
    expect(res.status).toBe(404);
  });

  it('should handle CORS preflight', async () => {
    const port = nextPort();
    server = new SynchServer({}, { port });
    await server.start();
    const res = await new Promise<http.IncomingMessage>((resolve, reject) => {
      const req = http.request(
        { method: 'OPTIONS', path: '/run', port, hostname: '127.0.0.1' },
        resolve
      );
      req.on('error', reject);
      req.end();
    });
    expect(res.statusCode).toBe(204);
  });
});
