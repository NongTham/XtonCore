// XtonCore Enhanced v2.0 Type Definitions
import { 
  Client, 
  APIApplicationCommand, 
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  ButtonInteraction,
  SelectMenuInteraction,
  ModalSubmitInteraction,
  PermissionResolvable
} from 'discord.js';

// Core Interfaces
export interface LocalCommand extends APIApplicationCommand {
  deleted?: boolean;
  cooldown?: number;
  permissions?: PermissionResolvable[];
  aliases?: string[];
  category?: string;
  ownerOnly?: boolean;
  guildOnly?: boolean;
  nsfw?: boolean;
  run: (options: CommandRunOptions) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
  [key: string]: any;
}

export interface CommandRunOptions {
  interaction: ChatInputCommandInteraction;
  client: Client;
  handler: ClientHandler;
}

export interface ComponentHandler {
  customId: string | RegExp;
  type: 'button' | 'selectMenu' | 'modal';
  run: (interaction: ButtonInteraction | SelectMenuInteraction | ModalSubmitInteraction, client: Client, handler: ClientHandler) => Promise<void>;
}

export interface ValidationFunction {
  (interaction: ChatInputCommandInteraction, command: LocalCommand, handler: ClientHandler, client: Client): Promise<boolean> | boolean;
}

// Configuration Interfaces
export interface ClientHandlerOptions {
  client: Client;
  commandsPath?: string;
  eventsPath?: string;
  validationsPath?: string;
  componentsPath?: string;
  guild?: string;
  ownerIds?: string[];
  enableHotReload?: boolean;
  rateLimiting?: {
    enabled: boolean;
    defaultLimit?: number;
    defaultWindow?: number;
  };
  performance?: {
    enabled: boolean;
    trackMemory?: boolean;
  };
}

// Statistics and Performance Interfaces
export interface CommandStats {
  name: string;
  uses: number;
  errors: number;
  lastUsed: Date;
  averageExecutionTime: number;
}

export interface PerformanceMetrics {
  commandExecutions: Map<string, number>;
  commandErrors: Map<string, number>;
  commandTimes: Map<string, number[]>;
  memoryUsage: number[];
  uptime: number;
}

export interface CooldownData {
  userId: string;
  commandName: string;
  expiresAt: number;
}

// Main ClientHandler Class
export declare class ClientHandler {
  constructor(options: ClientHandlerOptions);
  
  static create(options: ClientHandlerOptions): Promise<ClientHandler>;
  
  // Getters
  get commands(): LocalCommand[];
  get commandMap(): ReadonlyMap<string, LocalCommand>;
  get client(): Client;
  get performanceManager(): PerformanceManager;
  get cooldownManager(): CooldownManager;
  get componentManager(): ComponentManager;
  get permissionManager(): PermissionManager;
  get rateLimiter(): RateLimiter;
  get hotReloadManager(): HotReloadManager;
  
  // Methods
  reloadCommands(): Promise<void>;
  reloadComponents(): Promise<void>;
  getStats(): any;
  generateReport(): string;
  destroy(): void;
}

// Manager Classes
export declare class PerformanceManager {
  recordCommandExecution(commandName: string, executionTime: number): void;
  recordCommandError(commandName: string): void;
  getCommandStats(commandName?: string): CommandStats[] | CommandStats | null;
  getTopCommands(limit?: number): CommandStats[];
  getPerformanceMetrics(): PerformanceMetrics;
  getMemoryUsage(): { current: number; average: number; peak: number };
  generateReport(): string;
}

export declare class CooldownManager {
  setCooldown(userId: string, commandName: string, duration: number): void;
  getCooldown(userId: string, commandName: string): CooldownData | null;
  getRemainingTime(userId: string, commandName: string): number;
  isOnCooldown(userId: string, commandName: string): boolean;
  removeCooldown(userId: string, commandName: string): boolean;
  clearUserCooldowns(userId: string): number;
  getAllCooldowns(): CooldownData[];
  getCooldownCount(): number;
  destroy(): void;
}

export declare class ComponentManager {
  constructor(client: Client, componentsPath?: string);
  initialize(): Promise<void>;
  addHandler(handler: ComponentHandler): void;
  removeHandler(customId: string | RegExp, type: ComponentHandler['type']): boolean;
  getHandlers(): ComponentHandler[];
  getHandlerCount(): number;
}

export declare class PermissionManager {
  constructor(ownerIds?: string[]);
  addOwner(userId: string): void;
  removeOwner(userId: string): boolean;
  isOwner(userId: string): boolean;
  blacklistUser(userId: string): void;
  unblacklistUser(userId: string): boolean;
  isUserBlacklisted(userId: string): boolean;
  blacklistGuild(guildId: string): void;
  unblacklistGuild(guildId: string): boolean;
  isGuildBlacklisted(guildId: string): boolean;
  checkPermissions(interaction: ChatInputCommandInteraction, command: LocalCommand): Promise<{ allowed: boolean; reason?: string }>;
  getUserPermissions(userId: string, guildId?: string): string[];
  clearPermissionCache(userId?: string, guildId?: string): void;
  getStats(): any;
}

export declare class RateLimiter {
  constructor(defaultLimit?: number, defaultWindow?: number);
  checkLimit(identifier: string, action?: string, limit?: number, windowSeconds?: number): { allowed: boolean; remaining: number; resetTime: number; blocked: boolean };
  isBlocked(identifier: string, action?: string): boolean;
  getRemainingTime(identifier: string, action?: string): number;
  clearLimit(identifier: string, action?: string): boolean;
  getStats(): any;
  destroy(): void;
}

export declare class HotReloadManager {
  constructor(enabled?: boolean);
  watchDirectory(directory: string, callback: (filePath: string) => Promise<void>, options?: { recursive?: boolean; extensions?: string[] }): void;
  stopWatching(directory: string): boolean;
  stopAllWatching(): void;
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
  getWatchedDirectories(): string[];
  getStats(): any;
  destroy(): void;
}

// Utility Classes
export declare class InputSanitizer {
  static sanitizeString(input: string, options?: any): string;
  static sanitizeDiscordContent(content: string): string;
  static validateUserId(userId: string): boolean;
  static validateGuildId(guildId: string): boolean;
  static validateChannelId(channelId: string): boolean;
  static escapeRegex(string: string): string;
  static isValidUrl(url: string): boolean;
  static sanitizeFileName(fileName: string): string;
}

export declare class EnhancedEmbedBuilder {
  static createBasic(title?: string, description?: string, color?: any): any;
  static createSuccess(title?: string, description?: string): any;
  static createError(title?: string, description?: string): any;
  static createWarning(title?: string, description?: string): any;
  static createInfo(title?: string, description?: string): any;
  static createLoading(title?: string, description?: string): any;
  static createUserProfile(user: any): any;
  static createGuildInfo(guild: any): any;
  static createCommandHelp(commandName: string, description: string, usage: string, examples?: string[], aliases?: string[]): any;
  static createPagination(items: string[], page: number, itemsPerPage?: number, title?: string): any;
  static createStats(stats: Record<string, string | number>): any;
  static createProgressBar(current: number, max: number, length?: number, title?: string): any;
  static readonly COLORS: any;
}

export declare class ComponentHelpers {
  static createButton(customId: string, label: string, style?: any, options?: any): any;
  static createLinkButton(url: string, label: string, emoji?: string): any;
  static createConfirmButtons(confirmId?: string, cancelId?: string): any;
  static createPaginationButtons(currentPage: number, totalPages: number, baseId?: string): any;
  static createNumberButtons(baseId?: string, start?: number, end?: number): any;
  static createSelectMenu(customId: string, placeholder: string, options: any[], settings?: any): any;
  static createSelectMenuRow(customId: string, placeholder: string, options: any[], settings?: any): any;
  static createModal(customId: string, title: string, inputs: any[]): any;
  static createButtonRow(...buttons: any[]): any;
  static disableAllComponents(components: any[]): any[];
  static createLoadingButton(customId?: string, label?: string): any;
  static readonly COMMON_OPTIONS: any;
}

export declare class CommandBuilder {
  static createSlashCommand(name: string, description: string): any;
  static createUserContextMenu(name: string): any;
  static createMessageContextMenu(name: string): any;
  static addCommonOptions(builder: any, options?: any): any;
  static createSubcommandGroup(builder: any, name: string, description: string): any;
  static addStringOption(builder: any, name: string, description: string, options?: any): any;
  static addIntegerOption(builder: any, name: string, description: string, options?: any): any;
  static addBooleanOption(builder: any, name: string, description: string, required?: boolean): any;
  static addUserOption(builder: any, name: string, description: string, required?: boolean): any;
  static addChannelOption(builder: any, name: string, description: string, options?: any): any;
  static addRoleOption(builder: any, name: string, description: string, required?: boolean): any;
  static addAttachmentOption(builder: any, name: string, description: string, required?: boolean): any;
  static readonly PERMISSIONS: any;
  static readonly CHANNEL_TYPES: any;
}

// Enhanced Logger
export declare class EnhancedLogger {
  constructor(logger: any, context?: string);
  info(message: string, meta?: any): void;
  error(message: string, error?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
  verbose(message: string, meta?: any): void;
  performance(operation: string, duration: number, meta?: any): void;
  command(commandName: string, userId: string, guildId?: string): void;
  createChild(context: string): EnhancedLogger;
}

export declare const Logger: EnhancedLogger;
export declare const Clientlogger: any;
