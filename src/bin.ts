#!/usr/bin/env node

import { startCLI } from './cli/cli';
import { startServer } from './web/server';

const args = process.argv.slice(2);

if (args[0] === 'serve') {
  const portIndex = args.indexOf('--port');
  const port = portIndex !== -1 ? parseInt(args[portIndex + 1], 10) : undefined;
  startServer(port);
} else {
  startCLI();
}
