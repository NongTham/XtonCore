import { Clientlogger } from '../logger';

interface RateLimitData {
  count: number;
  resetTime: number;
  blocked: boolean;
}

export class RateLimiter {
  private limits: Map<string, RateLimitData>;
  private defaultLimit: number;
  private defaultWindow: number; // in seconds
  private cleanupInterval!: NodeJS.Timeout;

  constructor(defaultLimit: number = 5, defaultWindow: number = 60) {
    this.limits = new Map();
    this.defaultLimit = defaultLimit;
    this.defaultWindow = defaultWindow;
    this.startCleanup();
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.limits.entries()) {
        if (data.resetTime <= now) {
          this.limits.delete(key);
        }
      }
    }, 30000); // Clean every 30 seconds
  }

  private getKey(identifier: string, action: string = 'default'): string {
    return `${identifier}:${action}`;
  }

  public checkLimit(
    identifier: string, 
    action: string = 'default',
    limit: number = this.defaultLimit,
    windowSeconds: number = this.defaultWindow
  ): { allowed: boolean; remaining: number; resetTime: number; blocked: boolean } {
    const key = this.getKey(identifier, action);
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    
    let data = this.limits.get(key);
    
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

    this.limits.set(key, data);

    return {
      allowed,
      remaining: Math.max(0, limit - data.count),
      resetTime: data.resetTime,
      blocked: data.blocked
    };
  }

  public isBlocked(identifier: string, action: string = 'default'): boolean {
    const key = this.getKey(identifier, action);
    const data = this.limits.get(key);
    
    if (!data) return false;
    
    const now = Date.now();
    if (data.resetTime <= now) {
      this.limits.delete(key);
      return false;
    }
    
    return data.blocked;
  }

  public getRemainingTime(identifier: string, action: string = 'default'): number {
    const key = this.getKey(identifier, action);
    const data = this.limits.get(key);
    
    if (!data) return 0;
    
    const now = Date.now();
    return Math.max(0, Math.ceil((data.resetTime - now) / 1000));
  }

  public clearLimit(identifier: string, action?: string): boolean {
    if (action) {
      const key = this.getKey(identifier, action);
      return this.limits.delete(key);
    } else {
      // Clear all limits for this identifier
      let cleared = 0;
      for (const key of this.limits.keys()) {
        if (key.startsWith(`${identifier}:`)) {
          this.limits.delete(key);
          cleared++;
        }
      }
      return cleared > 0;
    }
  }

  public getStats(): {
    totalLimits: number;
    blockedLimits: number;
    activeLimits: number;
  } {
    const now = Date.now();
    let blocked = 0;
    let active = 0;

    for (const data of this.limits.values()) {
      if (data.resetTime > now) {
        active++;
        if (data.blocked) {
          blocked++;
        }
      }
    }

    return {
      totalLimits: this.limits.size,
      blockedLimits: blocked,
      activeLimits: active
    };
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.limits.clear();
  }
}