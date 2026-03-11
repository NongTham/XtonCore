import { CooldownData } from '../dev';
import { Clientlogger } from '../logger';
import { IStorageAdapter } from '../interfaces/IStorageAdapter';
import { MemoryAdapter } from '../adapters/MemoryAdapter';

export class CooldownManager {
  private adapter: IStorageAdapter;
  private namespace = 'cooldowns';

  constructor(adapter?: IStorageAdapter) {
    this.adapter = adapter || new MemoryAdapter();
  }

  private getCooldownKey(userId: string, commandName: string): string {
    return `${userId}-${commandName}`;
  }

  public async setCooldown(userId: string, commandName: string, duration: number): Promise<void> {
    const key = this.getCooldownKey(userId, commandName);
    const expiresAt = Date.now() + (duration * 1000);

    const data: CooldownData = {
      userId,
      commandName,
      expiresAt
    };

    // Store in adapter with TTL slightly longer than cooldown to allow for drift
    await this.adapter.set(this.namespace, key, data, duration + 5);

    Clientlogger.debug(`Set cooldown for user ${userId} on command ${commandName} for ${duration}s`);
  }

  public async getCooldown(userId: string, commandName: string): Promise<CooldownData | null> {
    const key = this.getCooldownKey(userId, commandName);
    const cooldown = await this.adapter.get<CooldownData>(this.namespace, key);

    if (!cooldown) return null;

    // Check if expired
    if (cooldown.expiresAt <= Date.now()) {
      await this.adapter.delete(this.namespace, key);
      return null;
    }

    return cooldown;
  }

  public async getRemainingTime(userId: string, commandName: string): Promise<number> {
    const cooldown = await this.getCooldown(userId, commandName);
    if (!cooldown) return 0;

    return Math.max(0, Math.ceil((cooldown.expiresAt - Date.now()) / 1000));
  }

  public async isOnCooldown(userId: string, commandName: string): Promise<boolean> {
    const cooldown = await this.getCooldown(userId, commandName);
    return cooldown !== null;
  }

  public async removeCooldown(userId: string, commandName: string): Promise<boolean> {
    const key = this.getCooldownKey(userId, commandName);
    return await this.adapter.delete(this.namespace, key);
  }

  public async clearUserCooldowns(userId: string): Promise<number> {
    let cleared = 0;

    // We attempt to use getAll if supported by the adapter
    if (this.adapter.getAll) {
      const allCooldowns = await this.adapter.getAll<CooldownData>(this.namespace);
      for (const data of allCooldowns) {
        if (data.userId === userId) {
          await this.adapter.delete(this.namespace, this.getCooldownKey(data.userId, data.commandName));
          cleared++;
        }
      }
    } else if (this.adapter.getKeys) {
      const keys = await this.adapter.getKeys(this.namespace);
      for (const key of keys) {
        if (key.startsWith(`${userId}-`)) {
          await this.adapter.delete(this.namespace, key);
          cleared++;
        }
      }
    }
    return cleared;
  }

  public async getAllCooldowns(): Promise<CooldownData[]> {
    if (this.adapter.getAll) {
      return await this.adapter.getAll<CooldownData>(this.namespace);
    }
    return [];
  }

  public async getCooldownCount(): Promise<number> {
    if (this.adapter.getKeys) {
      const keys = await this.adapter.getKeys(this.namespace);
      return keys.length;
    }
    return 0;
  }

  public async destroy(): Promise<void> {
    await this.adapter.clear(this.namespace);
    if (this.adapter.disconnect) {
      await this.adapter.disconnect();
    }
  }
}