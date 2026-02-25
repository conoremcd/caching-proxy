export interface CachedResponse {
  headers: Record<string, string>;
  body: string;
  timestamp: number;
}

export type CacheStore = Record<string, CachedResponse>;