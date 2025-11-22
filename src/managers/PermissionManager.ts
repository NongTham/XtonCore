import { 
  ChatInputCommandInteraction, 
  PermissionResolvable, 
  GuildMember,
  PermissionsBitField
} from 'discord.js';
import { LocalCommand } from '../dev';
import { Clientlogger } from '../logger';

export class PermissionManager {
  private ownerIds: Set<string>;
  private blacklistedUsers: Set<string>;
  private blacklistedGuilds: Set<string>;
  private permissionCache: Map<string, { permissions: string[]; expiresAt: number }>;

  constructor(ownerIds: string[] = []) {
    this.ownerIds = new Set(ownerIds);
    this.blacklistedUsers = new Set();
    this.blacklistedGuilds = new Set();
    this.permissionCache = new Map();
    this.startCacheCleanup();
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.permissionCache.entries()) {
        if (data.expiresAt <= now) {
          this.permissionCache.delete(key);
        }
      }
    }, 300000); // Clean every 5 minutes
  }

  public addOwner(userId: string): void {
    this.ownerIds.add(userId);
    Clientlogger.info(`Added owner: ${userId}`);
  }

  public removeOwner(userId: string): boolean {
    const removed = this.ownerIds.delete(userId);
    if (removed) {
      Clientlogger.info(`Removed owner: ${userId}`);
    }
    return removed;
  }

  public isOwner(userId: string): boolean {
    return this.ownerIds.has(userId);
  }

  public blacklistUser(userId: string): void {
    this.blacklistedUsers.add(userId);
    Clientlogger.info(`Blacklisted user: ${userId}`);
  }

  public unblacklistUser(userId: string): boolean {
    const removed = this.blacklistedUsers.delete(userId);
    if (removed) {
      Clientlogger.info(`Removed user from blacklist: ${userId}`);
    }
    return removed;
  }

  public isUserBlacklisted(userId: string): boolean {
    return this.blacklistedUsers.has(userId);
  }

  public blacklistGuild(guildId: string): void {
    this.blacklistedGuilds.add(guildId);
    Clientlogger.info(`Blacklisted guild: ${guildId}`);
  }

  public unblacklistGuild(guildId: string): boolean {
    const removed = this.blacklistedGuilds.delete(guildId);
    if (removed) {
      Clientlogger.info(`Removed guild from blacklist: ${guildId}`);
    }
    return removed;
  }

  public isGuildBlacklisted(guildId: string): boolean {
    return this.blacklistedGuilds.has(guildId);
  }

  public async checkPermissions(
    interaction: ChatInputCommandInteraction,
    command: LocalCommand
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Check blacklists first
    if (this.isUserBlacklisted(interaction.user.id)) {
      return { allowed: false, reason: 'User is blacklisted' };
    }

    if (interaction.guildId && this.isGuildBlacklisted(interaction.guildId)) {
      return { allowed: false, reason: 'Guild is blacklisted' };
    }

    // Check owner-only commands
    if (command.ownerOnly && !this.isOwner(interaction.user.id)) {
      return { allowed: false, reason: 'This command is owner-only' };
    }

    // Check guild-only commands
    if (command.guildOnly && !interaction.guildId) {
      return { allowed: false, reason: 'This command can only be used in servers' };
    }

    // Check NSFW commands
    if (command.nsfw && interaction.channel && !('nsfw' in interaction.channel && interaction.channel.nsfw)) {
      return { allowed: false, reason: 'This command can only be used in NSFW channels' };
    }

    // Check Discord permissions
    if (command.permissions && command.permissions.length > 0 && interaction.member instanceof GuildMember) {
      const hasPermissions = await this.checkDiscordPermissions(interaction.member, command.permissions);
      if (!hasPermissions.allowed) {
        return hasPermissions;
      }
    }

    return { allowed: true };
  }

  private async checkDiscordPermissions(
    member: GuildMember,
    requiredPermissions: PermissionResolvable[]
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // Check cache first
      const cacheKey = `${member.id}-${member.guild.id}`;
      const cached = this.permissionCache.get(cacheKey);
      
      let memberPermissions: string[];
      
      if (cached && cached.expiresAt > Date.now()) {
        memberPermissions = cached.permissions;
      } else {
        // Refresh permissions
        await member.fetch();
        memberPermissions = member.permissions.toArray();
        
        // Cache for 10 minutes
        this.permissionCache.set(cacheKey, {
          permissions: memberPermissions,
          expiresAt: Date.now() + 600000
        });
      }

      const permissions = new PermissionsBitField(memberPermissions as any);
      const missing: string[] = [];

      for (const permission of requiredPermissions) {
        if (!permissions.has(permission)) {
          missing.push(permission.toString());
        }
      }

      if (missing.length > 0) {
        return {
          allowed: false,
          reason: `Missing permissions: ${missing.join(', ')}`
        };
      }

      return { allowed: true };
    } catch (error) {
      Clientlogger.error('Error checking Discord permissions:', error);
      return { allowed: false, reason: 'Error checking permissions' };
    }
  }

  public getUserPermissions(userId: string, guildId?: string): string[] {
    if (!guildId) return [];
    
    const cacheKey = `${userId}-${guildId}`;
    const cached = this.permissionCache.get(cacheKey);
    
    return cached && cached.expiresAt > Date.now() ? cached.permissions : [];
  }

  public clearPermissionCache(userId?: string, guildId?: string): void {
    if (userId && guildId) {
      this.permissionCache.delete(`${userId}-${guildId}`);
    } else {
      this.permissionCache.clear();
    }
    Clientlogger.debug('Permission cache cleared');
  }

  public getStats(): {
    owners: number;
    blacklistedUsers: number;
    blacklistedGuilds: number;
    cachedPermissions: number;
  } {
    return {
      owners: this.ownerIds.size,
      blacklistedUsers: this.blacklistedUsers.size,
      blacklistedGuilds: this.blacklistedGuilds.size,
      cachedPermissions: this.permissionCache.size
    };
  }
}