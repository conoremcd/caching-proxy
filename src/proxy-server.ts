import * as http from 'http';
import fetch from 'node-fetch';
import * as cacheManager from '@/cache-manager';

export const startServer = (port: number, origin: string, ttl: number) => {
  const server = http.createServer(async (req, res) => {
    const cacheKey = `${req.method}:${req.url}`;
    const cached = cacheManager.getCachedResponse(cacheKey, ttl);

    if (cached) {
      console.log(`[HIT] ${req.url}`);
      res.writeHead(200, { ...cached.headers, 'X-Cache': 'HIT' });
      return res.end(cached.body);
    }

    console.log(`[MISS] ${req.url} -> ${origin}`);
    try {
      const response = await fetch(`${origin}${req.url}`, {
        method: req.method,
        headers: { ...req.headers as any, host: new URL(origin).host }
      });

      const body = await response.text();
      const headers = Object.fromEntries(response.headers.entries());

      cacheManager.setCachedResponse(cacheKey, { headers, body });
      res.writeHead(response.status, { ...headers, 'X-Cache': 'MISS' });
      res.end(body);
    } catch (err: any) {
      res.writeHead(500);
      res.end(`Proxy Error: ${err.message}`);
    }
  });

  server.listen(port, () => {
    console.log(`Proxy running on http://localhost:${port} (TTL: ${ttl}s)`);
  });

  const shutdown = (signal: string) => {
    console.log(`\n${signal} received. Closing server...`);
    server.close(() => {
      console.log('Server gracefully closed.');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 5000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};
