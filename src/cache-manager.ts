import * as fs from 'fs';
import * as path from 'path';
import { CachedResponse, CacheStore } from '@/types/types';

const CACHE_FILE = path.join(process.cwd(), 'cache.json');

const getCache = (): CacheStore => {
  if (!fs.existsSync(CACHE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch { return {}; }
};

export const clearCache = () => {
  if (fs.existsSync(CACHE_FILE)) fs.unlinkSync(CACHE_FILE);
  console.log('Cache cleared.');
};

export const getCachedResponse = (key: string, ttlSeconds: number): CachedResponse | null => {
  const cache = getCache();
  const item = cache[key];
  if (!item) return null;

  const isExpired = (Date.now() - item.timestamp) > (ttlSeconds * 1000);
  if (isExpired) return null;

  return item;
};

export const setCachedResponse = (key: string, data: Omit<CachedResponse, 'timestamp'>) => {
  const cache = getCache();
  cache[key] = { ...data, timestamp: Date.now() };
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
};
