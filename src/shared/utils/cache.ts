type CacheEntry<T = unknown> = {
  value: T;
  expiresAt: number;
};

class SimpleCache {
  private store: Map<string, CacheEntry> = new Map();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  del(key: string): void {
    this.store.delete(key);
  }

  delByPrefix(prefix: string): void {
    for (const k of this.store.keys()) {
      if (k.startsWith(prefix)) this.store.delete(k);
    }
  }

  clear(): void {
    this.store.clear();
  }
}

class NoopCache {
  private store: Map<string, any> = new Map();

  get<T>(key: string): T | null {
    return null;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    // no-op
  }

  del(key: string): void {
    // no-op
  }

  delByPrefix(prefix: string): void {
    // no-op
  }

  clear(): void {
    // no-op
  }
}

export const cache = new NoopCache();