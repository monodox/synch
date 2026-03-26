import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SynchCLI } from '../src/cli/cli';

describe('SynchCLI', () => {
  let cli: SynchCLI;
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let exitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    cli = new SynchCLI();
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should print help on "help" command', async () => {
    await cli.run(['help']);
    expect(logSpy).toHaveBeenCalled();
    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain('Synch CLI');
    expect(output).toContain('Usage');
  });

  it('should print help on "--help" flag', async () => {
    await cli.run(['--help']);
    expect(logSpy).toHaveBeenCalled();
    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain('Synch CLI');
  });

  it('should print version on "version" command', async () => {
    await cli.run(['version']);
    expect(logSpy).toHaveBeenCalled();
    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toMatch(/synch v/);
  });

  it('should show stats on "stats" command', async () => {
    await cli.run(['stats']);
    expect(logSpy).toHaveBeenCalled();
    const output = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(output).toHaveProperty('cacheHits');
    expect(output).toHaveProperty('cacheMisses');
  });

  it('should run with --input flag', async () => {
    await cli.run(['run', '--input', '{"input": "hello"}']);
    expect(logSpy).toHaveBeenCalled();
    const output = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(output.output).toBe('hello');
    expect(output.cached).toBe(false);
  });

  it('should wrap raw JSON in input object', async () => {
    await cli.run(['run', '--input', '"raw string"']);
    expect(logSpy).toHaveBeenCalled();
    const output = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(output.output).toBe('raw string');
  });

  it('should error on unknown command', async () => {
    await cli.run(['bogus']);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown command'));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('should error when no input provided to run in TTY mode', async () => {
    // Simulate TTY (no piped stdin)
    const origTTY = process.stdin.isTTY;
    Object.defineProperty(process.stdin, 'isTTY', { value: true, configurable: true });

    await cli.run(['run']);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('No input provided'));
    expect(exitSpy).toHaveBeenCalledWith(1);

    Object.defineProperty(process.stdin, 'isTTY', { value: origTTY, configurable: true });
  });
});
