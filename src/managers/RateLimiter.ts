import { Clientlogger } from '../logger';
import { IStorageAdapter } from '../interfaces/IStorageAdapter';
import { MemoryAdapter } from '../adapters/MemoryAdapter';

export interface RateLimitData {
  count: number;
  resetTime: number;
  blocked: boolean;
}

export class RateLimiter {
  private adapter: IStorageAdapter;
  private namespace = 'ratelimits';
  private defaultLimit: number;
  private defaultWindow: number; // in seconds

  constructor(defaultLimit: number = 5, defaultWindow: number = 60, adapter?: IStorageAdapter) {
    this.adapter = adapter || new MemoryAdapter();
    this.defaultLimit = defaultLimit;
    this.defaultWindow = defaultWindow;
  }

  private getKey(identifier: string, action: string = 'default'): string {
    return `${identifier}:${action}`;
  }

  public async checkLimit(
    identifier: string,
    action: string = 'default',
    limit: number = this.defaultLimit,
    windowSeconds: number = this.defaultWindow
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number; blocked: boolean }> {
    const key = this.getKey(identifier, action);
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    let data = await this.adapter.get<RateLimitData>(this.namespace, key);

    if (!data || data.resetTime <= now) {
      // Create new or reset expired limit
      data = {
        count: 0,
        resetTime: now + windowMs,
        blocked: false
      };
    }

    // Check if currently blocked
    if (data.blocked && data.resetTime > now) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: data.resetTime,
        blocked: true
      };
    }

    // Reset block status if window expired
    if (data.resetTime <= now) {
      data.blocked = false;
      data.count = 0;
      data.resetTime = now + windowMs;
    }

    const allowed = data.count < limit;

    if (allowed) {
      data.count++;
    } else {
      // Block for the remainder of the window
      data.blocked = true;
      Clientlogger.warn(`Rate limit exceeded for ${identifier}:${action}`);
    }

    // Store in adapter with TTL matching the rest of the window + buffer
    const ttl = Math.ceil((data.resetTime - now) / 1000) + 5;
    await this.adapter.set(this.namespace, key, data, ttl);

    return {
      allowed,
      remaining: Math.max(0, limit - data.count),
      resetTime: data.resetTime,
      blocked: data.blocked
    };
  }

  public async isBlocked(identifier: string, action: string = 'default'): Promise<boolean> {
    const key = this.getKey(identifier, action);
    const data = await this.adapter.get<RateLimitData>(this.namespace, key);

    if (!data) return false;

    const now = Date.now();
    if (data.resetTime <= now) {
      await this.adapter.delete(this.namespace, key);
      return false;
    }

    return data.blocked;
  }

  public async getRemainingTime(identifier: string, action: string = 'default'): Promise<number> {
    const key = this.getKey(identifier, action);
    const data = await this.adapter.get<RateLimitData>(this.namespace, key);

    if (!data) return 0;

    const now = Date.now();
    return Math.max(0, Math.ceil((data.resetTime - now) / 1000));
  }

  public async clearLimit(identifier: string, action?: string): Promise<boolean> {
    if (action) {
      const key = this.getKey(identifier, action);
      return await this.adapter.delete(this.namespace, key);
    } else {
      // Clear all limits for this identifier
      let cleared = 0;
      if (this.adapter.getKeys) {
        const keys = await this.adapter.getKeys(this.namespace);
        for (const key of keys) {
          if (key.startsWith(`${identifier}:`)) {
            await this.adapter.delete(this.namespace, key);
            cleared++;
          }
        }
      }
      return cleared > 0;
    }
  }

  public async getStats(): Promise<{
    totalLimits: number;
    blockedLimits: number;
    activeLimits: number;
  }> {
    const now = Date.now();
    let blocked = 0;
    let active = 0;
    let total = 0;

    if (this.adapter.getAll) {
      const allData = await this.adapter.getAll<RateLimitData>(this.namespace);
      total = allData.length;

      for (const data of allData) {
        if (data.resetTime > now) {
          active++;
          if (data.blocked) {
            blocked++;
          }
        }
      }
    }

    return {
      totalLimits: total,
      blockedLimits: blocked,
      activeLimits: active
    };
  }

  public async destroy(): Promise<void> {
    await this.adapter.clear(this.namespace);
    if (this.adapter.disconnect) {
      await this.adapter.disconnect();
    }
  }
}