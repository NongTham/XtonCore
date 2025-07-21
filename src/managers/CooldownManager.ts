import { CooldownData } from '../dev';
import { Clientlogger } from '../logger';

export class CooldownManager {
  private cooldowns: Map<string, CooldownData>;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cooldowns = new Map();
    this.startCleanup();
  }

  private startCleanup(): void {
    // Clean expired cooldowns every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.cooldowns.entries()) {
        if (data.expiresAt <= now) {
          this.cooldowns.delete(key);
        }
      }
    }, 60000);
  }

  private getCooldownKey(userId: string, commandName: string): string {
    return `${userId}-${commandName}`;
  }

  public setCooldown(userId: string, commandName: string, duration: number): void {
    const key = this.getCooldownKey(userId, commandName);
    const expiresAt = Date.now() + (duration * 1000);
    
    this.cooldowns.set(key, {
      userId,
      commandName,
      expiresAt
    });

    Clientlogger.debug(`Set cooldown for user ${userId} on command ${commandName} for ${duration}s`);
  }

  public getCooldown(userId: string, commandName: string): CooldownData | null {
    const key = this.getCooldownKey(userId, commandName);
    const cooldown = this.cooldowns.get(key);
    
    if (!cooldown) return null;
    
    // Check if expired
    if (cooldown.expiresAt <= Date.now()) {
      this.cooldowns.delete(key);
      return null;
    }
    
    return cooldown;
  }

  public getRemainingTime(userId: string, commandName: string): number {
    const cooldown = this.getCooldown(userId, commandName);
    if (!cooldown) return 0;
    
    return Math.max(0, Math.ceil((cooldown.expiresAt - Date.now()) / 1000));
  }

  public isOnCooldown(userId: string, commandName: string): boolean {
    return this.getCooldown(userId, commandName) !== null;
  }

  public removeCooldown(userId: string, commandName: string): boolean {
    const key = this.getCooldownKey(userId, commandName);
    return this.cooldowns.delete(key);
  }

  public clearUserCooldowns(userId: string): number {
    let cleared = 0;
    for (const [key, data] of this.cooldowns.entries()) {
      if (data.userId === userId) {
        this.cooldowns.delete(key);
        cleared++;
      }
    }
    return cleared;
  }

  public getAllCooldowns(): CooldownData[] {
    return Array.from(this.cooldowns.values());
  }

  public getCooldownCount(): number {
    return this.cooldowns.size;
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cooldowns.clear();
  }
}