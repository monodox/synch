import { createSynch } from '../createSynch';
import { Synch, SynchConfig } from '../types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * CLI interface for Synch runtime.
 * Supports running tasks from JSON input via stdin or file,
 * and displaying stats.
 */
export class SynchCLI {
  private synch: Synch;

  constructor(config: SynchConfig = {}) {
    this.synch = createSynch(config);
  }

  /**
   * Parse CLI arguments and execute
   */
  async run(args: string[]): Promise<void> {
    const command = args[0];

    switch (command) {
      case 'run':
        await this.handleRun(args.slice(1));
        break;
      case 'stats':
        this.handleStats();
        break;
      case 'help':
      case '--help':
      case '-h':
        this.printHelp();
        break;
      case 'version':
      case '--version':
      case '-v':
        this.printVersion();
        break;
      default:
        console.error(`Unknown command: ${command ?? '(none)'}`);
        this.printHelp();
        process.exit(1);
    }
  }

  /**
   * Handle the 'run' command — execute a task with JSON input
   */
  private async handleRun(args: string[]): Promise<void> {
    let inputData: string | undefined;

    // Check for --file flag
    const fileIndex = args.indexOf('--file');
    if (fileIndex !== -1 && args[fileIndex + 1]) {
      const filePath = path.resolve(args[fileIndex + 1]);
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
      }
      inputData = fs.readFileSync(filePath, 'utf-8');
    }

    // Check for --input flag
    const inputIndex = args.indexOf('--input');
    if (inputIndex !== -1 && args[inputIndex + 1]) {
      inputData = args[inputIndex + 1];
    }

    // Read from stdin if no flags
    if (!inputData) {
      inputData = await this.readStdin();
    }

    if (!inputData) {
      console.error('No input provided. Use --input, --file, or pipe via stdin.');
      process.exit(1);
    }

    try {
      const parsed = JSON.parse(inputData);
      const input = parsed.input !== undefined ? parsed : { input: parsed };

      // Default task: echo/passthrough
      const result = await this.synch.run(input, (data) => data);

      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  }

  /**
   * Display current runtime stats
   */
  private handleStats(): void {
    const stats = this.synch.getStats();
    console.log(JSON.stringify(stats, null, 2));
  }

  /**
   * Print help text
   */
  private printHelp(): void {
    console.log(`
Synch CLI — AI task execution runtime

Usage:
  synch <command> [options]

Commands:
  run           Execute a task with JSON input
  stats         Show runtime statistics
  help          Show this help message
  version       Show version

Run options:
  --input <json>   Provide JSON input inline
  --file <path>    Read JSON input from a file
  (stdin)          Pipe JSON input via stdin

Examples:
  synch run --input '{"input": "hello"}'
  synch run --file input.json
  echo '{"input": "test"}' | synch run
    `.trim());
  }

  /**
   * Print version from package.json
   */
  private printVersion(): void {
    try {
      // Walk up from current file to find package.json
      let dir = __dirname;
      let pkg: { version: string } | undefined;
      for (let i = 0; i < 5; i++) {
        const candidate = path.join(dir, 'package.json');
        if (fs.existsSync(candidate)) {
          pkg = JSON.parse(fs.readFileSync(candidate, 'utf-8'));
          break;
        }
        dir = path.dirname(dir);
      }
      console.log(`synch v${pkg?.version ?? '1.0.0'}`);
    } catch {
      console.log('synch v1.0.0');
    }
  }

  /**
   * Read all data from stdin (non-interactive only)
   */
  private readStdin(): Promise<string | undefined> {
    return new Promise((resolve) => {
      if (process.stdin.isTTY) {
        resolve(undefined);
        return;
      }

      let data = '';
      process.stdin.setEncoding('utf-8');
      process.stdin.on('data', (chunk) => { data += chunk; });
      process.stdin.on('end', () => resolve(data || undefined));
      process.stdin.on('error', () => resolve(undefined));
    });
  }
}

/**
 * Entry point for CLI execution
 */
export function startCLI(): void {
  const cli = new SynchCLI();
  const args = process.argv.slice(2);
  cli.run(args).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
