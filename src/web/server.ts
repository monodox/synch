import * as http from 'http';
import { createSynch } from '../createSynch';
import { Synch, SynchConfig } from '../types';

/** Web server configuration */
export interface WebConfig {
  port?: number;
  host?: string;
}

/**
 * Lightweight HTTP server for Synch runtime.
 * Exposes POST /run and GET /stats endpoints.
 */
export class SynchServer {
  private synch: Synch;
  private server: http.Server | null = null;
  private config: Required<WebConfig>;

  constructor(synchConfig: SynchConfig = {}, webConfig: WebConfig = {}) {
    this.synch = createSynch(synchConfig);
    this.config = {
      port: webConfig.port ?? 3000,
      host: webConfig.host ?? '0.0.0.0',
    };
  }

  /**
   * Start the HTTP server
   */
  start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => this.handleRequest(req, res));
      this.server.listen(this.config.port, this.config.host, () => {
        console.log(`Synch server running at http://${this.config.host}:${this.config.port}`);
        resolve();
      });
    });
  }

  /**
   * Stop the HTTP server
   */
  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }
      this.server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Route incoming HTTP requests
   */
  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = req.url ?? '/';
    const method = req.method ?? 'GET';

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      if (url === '/run' && method === 'POST') {
        await this.handleRun(req, res);
      } else if (url === '/stats' && method === 'GET') {
        this.handleStats(res);
      } else if (url === '/health' && method === 'GET') {
        this.sendJSON(res, 200, { status: 'ok' });
      } else {
        this.sendJSON(res, 404, { error: 'Not found' });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.sendJSON(res, 500, { error: message });
    }
  }

  /**
   * Handle POST /run — execute a task with JSON body
   */
  private async handleRun(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const body = await this.readBody(req);

    if (!body) {
      this.sendJSON(res, 400, { error: 'Request body is required' });
      return;
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(body);
    } catch {
      this.sendJSON(res, 400, { error: 'Invalid JSON' });
      return;
    }

    const input = parsed.input !== undefined ? parsed : { input: parsed };
    const result = await this.synch.run(input as { input: unknown }, (data) => data);
    this.sendJSON(res, 200, result);
  }

  /**
   * Handle GET /stats
   */
  private handleStats(res: http.ServerResponse): void {
    this.sendJSON(res, 200, this.synch.getStats());
  }

  /**
   * Send a JSON response
   */
  private sendJSON(res: http.ServerResponse, status: number, data: unknown): void {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
  }

  /**
   * Read the full request body
   */
  private readBody(req: http.IncomingMessage): Promise<string | null> {
    return new Promise((resolve) => {
      let data = '';
      req.on('data', (chunk) => { data += chunk; });
      req.on('end', () => resolve(data || null));
      req.on('error', () => resolve(null));
    });
  }
}

/**
 * Entry point for web server
 */
export function startServer(port?: number): void {
  const server = new SynchServer({}, { port });
  server.start().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
