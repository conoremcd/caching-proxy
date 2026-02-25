#!/usr/bin/env ts-node
import { Command } from 'commander';
import { startServer } from '@/proxy-server';
import { clearCache } from '@/cache-manager';

const program = new Command();

program
  .option('--port <number>', 'Port for proxy')
  .option('--origin <url>', 'Origin URL')
  .option('--ttl <seconds>', 'TTL in seconds', '60')
  .option('--clear-cache', 'Clear cache file')
  .action((options) => {
    if (options.clearCache) return clearCache();
    if (!options.port || !options.origin) {
      console.error('Error: Port and Origin are required.');
      process.exit(1);
    }
    startServer(Number(options.port), options.origin, Number(options.ttl));
  });

program.parse(process.argv);
