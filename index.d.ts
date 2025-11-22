// XtonCore Enhanced v2.0 - Complete Type Definitions
// https://github.com/NarawitC/xtoncore

import { 
  Client, 
  APIApplicationCommand, 
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  ButtonInteraction,
  SelectMenuInteraction,
  ModalSubmitInteraction,
  PermissionResolvable,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  User,
  Guild,
  ColorResolvable,
  ButtonStyle,
  TextInputStyle,
  ChannelType
} from 'discord.js';

// ============================================================================
// Core Types
// ============================================================================

/**
 * Extended command interface with XtonCore features
 * @template TCustomData - Custom data type for extending command properties
 */
export interface LocalCommand<TCustomData = Record<string, any>> extends APIApplicationCommand {
  /** Whether this command should be deleted from Discord */
  deleted?: boolean;
  /** Cooldown duration in seconds */
  cooldown?: number;
  /** Required Discord permissions */
  permissions?: PermissionResolvable[];
  /** Command aliases (for future text command support) */
  aliases?: string[];
  /** Command category for organization */
  category?: string;
  /** Restrict command to bot owners only */
  ownerOnly?: boolean;
  /** Restrict command to guilds only (no DMs) */
  guildOnly?: boolean;
  /** Mark command as NSFW */
  nsfw?: boolean;
  /** Command execution function */
  run: (options: CommandRunOptions<TCustomData>) => Promise<void>;
  /** Autocomplete handler for command options */
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
  /** Custom data for extending command functionality */
  customData?: TCustomData;
  /** Allow additional properties */
  [key: string]: any;
}

/**
 * Options passed to command run function
 * @template TCustomData - Custom data type from command
 */
export interface CommandRunOptions<TCustomData = Record<string, any>> {
  /** The interaction that triggered this command */
  interaction: ChatInputCommandInteraction;
  /** Discord.js client instance */
  client: Client;
  /** XtonCore handler instance */
  handler: ClientHandler;
  /** Custom data from command definition */
  customData?: TCustomData;
}

/**
 * Component handler interface for buttons, select menus, and modals
 * @template TInteraction - Specific interaction type
 */
export interface ComponentHandler<TInteraction = ButtonInteraction | SelectMenuInteraction | ModalSubmitInteraction> {
  /** Custom ID or regex pattern to match */
  customId: string | RegExp;
  /** Component type */
  type: 'button' | 'selectMenu' | 'modal';
  /** Handler function */
  run: (interaction: TInteraction, client: Client, handler: ClientHandler) => Promise<void>;
}

/**
 * Validation function for command execution
 * @returns true to prevent command execution, false to allow
 */
export interface ValidationFunction {
  (
    interaction: ChatInputCommandInteraction, 
    command: LocalCommand, 
    handler: ClientHandler, 
    client: Client
  ): Promise<boolean> | boolean;
}

// ============================================================================
// Configuration Interfaces
// ============================================================================

/**
 * Configuration options for ClientHandler
 */
export interface ClientHandlerOptions {
  /** Discord.js client instance */
  client: Client;
  /** Path to commands directory */
  commandsPath?: string;
  /** Path to events directory */
  eventsPath?: string;
  /** Path to validations directory */
  validationsPath?: string;
  /** Path to components directory */
  componentsPath?: string;
  /** Guild ID for guild-specific commands (optional) */
  guild?: string;
  /** Array of owner user IDs */
  ownerIds?: string[];
  /** Enable hot reload (default: true in development) */
  enableHotReload?: boolean;
  /** ⚡ Enable lazy loading for faster startup (default: true) */
  lazyLoading?: boolean;
  /** Commands to preload immediately (useful for frequently used commands) */
  preloadCommands?: string[];
  /** Rate limiting configuration */
  rateLimiting?: RateLimitingOptions;
  /** Performance monitoring configuration */
  performance?: PerformanceOptions;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitingOptions {
  /** Enable rate limiting */
  enabled: boolean;
  /** Default requests per window */
  defaultLimit?: number;
  /** Default window duration in seconds */
  defaultWindow?: number;
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceOptions {
  /** Enable performance monitoring */
  enabled: boolean;
  /** Track memory usage */
  trackMemory?: boolean;
}

// ============================================================================
// Statistics and Performance Interfaces
// ============================================================================

/**
 * Statistics for a single command
 */
export interface CommandStats {
  /** Command name */
  name: string;
  /** Total number of uses */
  uses: number;
  /** Total number of errors */
  errors: number;
  /** Last time the command was used */
  lastUsed: Date;
  /** Average execution time in milliseconds */
  averageExecutionTime: number;
}

/**
 * Performance metrics for the bot
 */
export interface PerformanceMetrics {
  /** Map of command names to execution counts */
  commandExecutions: Map<string, number>;
  /** Map of command names to error counts */
  commandErrors: Map<string, number>;
  /** Map of command names to execution times array */
  commandTimes: Map<string, number[]>;
  /** Array of memory usage samples */
  memoryUsage: number[];
  /** Bot uptime in milliseconds */
  uptime: number;
}

/**
 * Cooldown data for a user-command pair
 */
export interface CooldownData {
  /** User ID */
  userId: string;
  /** Command name */
  commandName: string;
  /** Timestamp when cooldown expires */
  expiresAt: number;
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  /** Whether the action is allowed */
  allowed: boolean;
  /** Reason if not allowed */
  reason?: string;
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  /** Whether the action is allowed */
  allowed: boolean;
  /** Remaining requests in current window */
  remaining: number;
  /** Timestamp when the limit resets */
  resetTime: number;
  /** Whether the identifier is blocked */
  blocked: boolean;
}

/**
 * Memory usage statistics
 */
export interface MemoryUsage {
  /** Current memory usage in MB */
  current: number;
  /** Average memory usage in MB */
  average: number;
  /** Peak memory usage in MB */
  peak: number;
}

/**
 * Hot reload statistics
 */
export interface HotReloadStats {
  /** Whether hot reload is enabled */
  enabled: boolean;
  /** Number of watched directories */
  watchedDirectories: number;
  /** List of watched directory paths */
  directories: string[];
}

// ============================================================================
// Main ClientHandler Class
// ============================================================================

/**
 * Main handler class for XtonCore Enhanced
 * Manages commands, events, components, and all enhanced features
 */
export declare class ClientHandler {
  /**
   * Create a new ClientHandler instance
   * @param options - Configuration options
   * @returns Promise resolving to initialized ClientHandler
   */
  static create(options: ClientHandlerOptions): Promise<ClientHandler>;
  
  // Getters
  /** Get all loaded commands */
  get commands(): LocalCommand[];
  /** Get command map for quick lookups */
  get commandMap(): ReadonlyMap<string, LocalCommand>;
  /** Get Discord.js client instance */
  get client(): Client;
  /** Get performance manager instance */
  get performanceManager(): PerformanceManager;
  /** Get cooldown manager instance */
  get cooldownManager(): CooldownManager;
  /** Get component manager instance */
  get componentManager(): ComponentManager;
  /** Get permission manager instance */
  get permissionManager(): PermissionManager;
  /** Get rate limiter instance */
  get rateLimiter(): RateLimiter;
  /** Get hot reload manager instance */
  get hotReloadManager(): HotReloadManager;
  
  // Methods
  /**
   * Manually reload all commands
   * @throws Error if no commands path is configured
   */
  reloadCommands(): Promise<void>;
  
  /**
   * Manually reload all components
   * @throws Error if no components path is configured
   */
  reloadComponents(): Promise<void>;
  
  /**
   * ⚡ Reload everything in parallel for maximum speed
   * Reloads commands, components, and events simultaneously
   */
  reloadAll(): Promise<void>;
  
  /**
   * ⚡ Preload specific commands (useful for frequently used commands)
   * @param commandNames - Array of command names to preload
   */
  preloadCommands(commandNames: string[]): Promise<void>;
  
  /**
   * ⚡ Preload all commands (useful for production)
   */
  preloadAllCommands(): Promise<void>;
  
  /**
   * Get lazy loading statistics
   */
  getLazyLoadingStats(): {
    total: number;
    loaded: number;
    unloaded: number;
    percentage: number;
  };
  
  /**
   * Get comprehensive statistics about the handler
   */
  getStats(): {
    commands: number;
    performance: any;
    cooldowns: number;
    components: number;
    permissions: any;
    rateLimiter: any;
    hotReload: any;
  };
  
  /**
   * Generate a formatted report of handler statistics
   */
  generateReport(): string;
  
  /**
   * Clean up resources and stop all managers
   */
  destroy(): void;
}

// ============================================================================
// Manager Classes
// ============================================================================

/**
 * Manages performance monitoring and statistics
 */
export declare class PerformanceManager {
  /**
   * Record a command execution
   * @param commandName - Name of the command
   * @param executionTime - Execution time in milliseconds
   */
  recordCommandExecution(commandName: string, executionTime: number): void;
  
  /**
   * Record a command error
   * @param commandName - Name of the command
   */
  recordCommandError(commandName: string): void;
  
  /**
   * Get statistics for a specific command or all commands
   * @param commandName - Optional command name to filter
   */
  getCommandStats(commandName?: string): CommandStats[] | CommandStats | null;
  
  /**
   * Get top commands by usage
   * @param limit - Number of commands to return (default: 10)
   */
  getTopCommands(limit?: number): CommandStats[];
  
  /**
   * Get all performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics;
  
  /**
   * Get memory usage statistics
   */
  getMemoryUsage(): MemoryUsage;
  
  /**
   * Generate a formatted performance report
   */
  generateReport(): string;
}

/**
 * Manages command cooldowns
 */
export declare class CooldownManager {
  /**
   * Set a cooldown for a user-command pair
   * @param userId - User ID
   * @param commandName - Command name
   * @param duration - Duration in seconds
   */
  setCooldown(userId: string, commandName: string, duration: number): void;
  
  /**
   * Get cooldown data for a user-command pair
   * @param userId - User ID
   * @param commandName - Command name
   */
  getCooldown(userId: string, commandName: string): CooldownData | null;
  
  /**
   * Get remaining cooldown time in seconds
   * @param userId - User ID
   * @param commandName - Command name
   */
  getRemainingTime(userId: string, commandName: string): number;
  
  /**
   * Check if a user-command pair is on cooldown
   * @param userId - User ID
   * @param commandName - Command name
   */
  isOnCooldown(userId: string, commandName: string): boolean;
  
  /**
   * Remove a specific cooldown
   * @param userId - User ID
   * @param commandName - Command name
   * @returns true if cooldown was removed
   */
  removeCooldown(userId: string, commandName: string): boolean;
  
  /**
   * Clear all cooldowns for a user
   * @param userId - User ID
   * @returns Number of cooldowns cleared
   */
  clearUserCooldowns(userId: string): number;
  
  /**
   * Get all active cooldowns
   */
  getAllCooldowns(): CooldownData[];
  
  /**
   * Get total number of active cooldowns
   */
  getCooldownCount(): number;
  
  /**
   * Clean up expired cooldowns
   */
  destroy(): void;
}

/**
 * Manages component handlers (buttons, select menus, modals)
 */
export declare class ComponentManager {
  constructor(client: Client, componentsPath?: string);
  
  /**
   * Initialize and load all component handlers
   */
  initialize(): Promise<void>;
  
  /**
   * Add a component handler programmatically
   * @param handler - Component handler to add
   */
  addHandler(handler: ComponentHandler): void;
  
  /**
   * Remove a component handler
   * @param customId - Custom ID or regex pattern
   * @param type - Component type
   * @returns true if handler was removed
   */
  removeHandler(customId: string | RegExp, type: ComponentHandler['type']): boolean;
  
  /**
   * Get all registered handlers
   */
  getHandlers(): ComponentHandler[];
  
  /**
   * Get total number of registered handlers
   */
  getHandlerCount(): number;
}

/**
 * Manages permissions and access control
 */
export declare class PermissionManager {
  constructor(ownerIds?: string[]);
  
  /**
   * Add a bot owner
   * @param userId - User ID to add
   */
  addOwner(userId: string): void;
  
  /**
   * Remove a bot owner
   * @param userId - User ID to remove
   * @returns true if owner was removed
   */
  removeOwner(userId: string): boolean;
  
  /**
   * Check if a user is a bot owner
   * @param userId - User ID to check
   */
  isOwner(userId: string): boolean;
  
  /**
   * Blacklist a user
   * @param userId - User ID to blacklist
   */
  blacklistUser(userId: string): void;
  
  /**
   * Remove a user from blacklist
   * @param userId - User ID to unblacklist
   * @returns true if user was unblacklisted
   */
  unblacklistUser(userId: string): boolean;
  
  /**
   * Check if a user is blacklisted
   * @param userId - User ID to check
   */
  isUserBlacklisted(userId: string): boolean;
  
  /**
   * Blacklist a guild
   * @param guildId - Guild ID to blacklist
   */
  blacklistGuild(guildId: string): void;
  
  /**
   * Remove a guild from blacklist
   * @param guildId - Guild ID to unblacklist
   * @returns true if guild was unblacklisted
   */
  unblacklistGuild(guildId: string): boolean;
  
  /**
   * Check if a guild is blacklisted
   * @param guildId - Guild ID to check
   */
  isGuildBlacklisted(guildId: string): boolean;
  
  /**
   * Check all permissions for a command execution
   * @param interaction - Command interaction
   * @param command - Command to check
   */
  checkPermissions(interaction: ChatInputCommandInteraction, command: LocalCommand): Promise<PermissionCheckResult>;
  
  /**
   * Get user permissions in a guild
   * @param userId - User ID
   * @param guildId - Optional guild ID
   */
  getUserPermissions(userId: string, guildId?: string): string[];
  
  /**
   * Clear permission cache
   * @param userId - Optional user ID to clear specific cache
   * @param guildId - Optional guild ID to clear specific cache
   */
  clearPermissionCache(userId?: string, guildId?: string): void;
  
  /**
   * Get permission statistics
   */
  getStats(): {
    owners: number;
    blacklistedUsers: number;
    blacklistedGuilds: number;
    cacheSize: number;
  };
}

/**
 * Manages rate limiting
 */
export declare class RateLimiter {
  constructor(defaultLimit?: number, defaultWindow?: number);
  
  /**
   * Check if an action is rate limited
   * @param identifier - Unique identifier (usually user ID)
   * @param action - Action name (default: 'command')
   * @param limit - Optional custom limit
   * @param windowSeconds - Optional custom window in seconds
   */
  checkLimit(
    identifier: string, 
    action?: string, 
    limit?: number, 
    windowSeconds?: number
  ): RateLimitResult;
  
  /**
   * Check if an identifier is blocked
   * @param identifier - Unique identifier
   * @param action - Action name (default: 'command')
   */
  isBlocked(identifier: string, action?: string): boolean;
  
  /**
   * Get remaining time until rate limit resets
   * @param identifier - Unique identifier
   * @param action - Action name (default: 'command')
   * @returns Remaining time in seconds
   */
  getRemainingTime(identifier: string, action?: string): number;
  
  /**
   * Clear rate limit for an identifier
   * @param identifier - Unique identifier
   * @param action - Optional action name
   * @returns true if limit was cleared
   */
  clearLimit(identifier: string, action?: string): boolean;
  
  /**
   * Get rate limiter statistics
   */
  getStats(): {
    activeLimits: number;
    blockedLimits: number;
  };
  
  /**
   * Clean up expired limits
   */
  destroy(): void;
}

/**
 * Manages hot reload functionality
 */
export declare class HotReloadManager {
  constructor(enabled?: boolean);
  
  /**
   * Watch a directory for changes
   * @param directory - Directory path to watch
   * @param callback - Callback function when changes occur
   * @param options - Watch options
   */
  watchDirectory(
    directory: string, 
    callback: (filePath: string) => Promise<void>,
    options?: {
      recursive?: boolean;
      extensions?: string[];
    }
  ): void;
  
  /**
   * Stop watching a directory
   * @param directory - Directory path
   * @returns true if watcher was stopped
   */
  stopWatching(directory: string): boolean;
  
  /**
   * Stop watching all directories
   */
  stopAllWatching(): void;
  
  /**
   * Check if hot reload is enabled
   */
  isEnabled(): boolean;
  
  /**
   * Enable or disable hot reload
   * @param enabled - Enable state
   */
  setEnabled(enabled: boolean): void;
  
  /**
   * Get list of watched directories
   */
  getWatchedDirectories(): string[];
  
  /**
   * Get hot reload statistics
   */
  getStats(): HotReloadStats;
  
  /**
   * Clean up all watchers
   */
  destroy(): void;
}

// ============================================================================
// Utility Classes
// ============================================================================

/**
 * Input sanitization utilities
 */
export declare class InputSanitizer {
  /**
   * Sanitize a string input
   * @param input - Input string
   * @param options - Sanitization options
   */
  static sanitizeString(input: string, options?: {
    maxLength?: number;
    allowHtml?: boolean;
    allowSql?: boolean;
    trim?: boolean;
  }): string;
  
  /**
   * Sanitize Discord message content
   * @param content - Message content
   */
  static sanitizeDiscordContent(content: string): string;
  
  /**
   * Validate a Discord user ID
   * @param userId - User ID to validate
   */
  static validateUserId(userId: string): boolean;
  
  /**
   * Validate a Discord guild ID
   * @param guildId - Guild ID to validate
   */
  static validateGuildId(guildId: string): boolean;
  
  /**
   * Validate a Discord channel ID
   * @param channelId - Channel ID to validate
   */
  static validateChannelId(channelId: string): boolean;
  
  /**
   * Escape regex special characters
   * @param string - String to escape
   */
  static escapeRegex(string: string): string;
  
  /**
   * Validate a URL
   * @param url - URL to validate
   */
  static isValidUrl(url: string): boolean;
  
  /**
   * Sanitize a file name
   * @param fileName - File name to sanitize
   */
  static sanitizeFileName(fileName: string): string;
}

/**
 * Enhanced embed builder with preset styles
 */
export declare class EnhancedEmbedBuilder {
  /**
   * Create a basic embed
   */
  static createBasic(title?: string, description?: string, color?: ColorResolvable): EmbedBuilder;
  
  /**
   * Create a success embed (green)
   */
  static createSuccess(title?: string, description?: string): EmbedBuilder;
  
  /**
   * Create an error embed (red)
   */
  static createError(title?: string, description?: string): EmbedBuilder;
  
  /**
   * Create a warning embed (yellow)
   */
  static createWarning(title?: string, description?: string): EmbedBuilder;
  
  /**
   * Create an info embed (blue)
   */
  static createInfo(title?: string, description?: string): EmbedBuilder;
  
  /**
   * Create a loading embed (gray)
   */
  static createLoading(title?: string, description?: string): EmbedBuilder;
  
  /**
   * Create a user profile embed
   */
  static createUserProfile(user: User): EmbedBuilder;
  
  /**
   * Create a guild info embed
   */
  static createGuildInfo(guild: Guild): EmbedBuilder;
  
  /**
   * Create a command help embed
   */
  static createCommandHelp(
    commandName: string,
    description: string,
    usage: string,
    examples?: string[],
    aliases?: string[]
  ): EmbedBuilder;
  
  /**
   * Create a paginated embed
   */
  static createPagination(
    items: string[],
    page: number,
    itemsPerPage?: number,
    title?: string
  ): EmbedBuilder;
  
  /**
   * Create a statistics embed
   */
  static createStats(stats: Record<string, string | number>): EmbedBuilder;
  
  /**
   * Create a progress bar embed
   */
  static createProgressBar(
    current: number,
    max: number,
    length?: number,
    title?: string
  ): EmbedBuilder;
  
  /** Preset colors */
  static readonly COLORS: {
    SUCCESS: number;
    ERROR: number;
    WARNING: number;
    INFO: number;
    LOADING: number;
    PRIMARY: number;
    SECONDARY: number;
  };
}

/**
 * Component creation helpers
 */
export declare class ComponentHelpers {
  /**
   * Create a button
   */
  static createButton(
    customId: string,
    label: string,
    style?: ButtonStyle,
    options?: {
      emoji?: string;
      disabled?: boolean;
    }
  ): ButtonBuilder;
  
  /**
   * Create a link button
   */
  static createLinkButton(url: string, label: string, emoji?: string): ButtonBuilder;
  
  /**
   * Create confirm/cancel buttons
   */
  static createConfirmButtons(confirmId?: string, cancelId?: string): ActionRowBuilder<ButtonBuilder>;
  
  /**
   * Create pagination buttons
   */
  static createPaginationButtons(
    currentPage: number,
    totalPages: number,
    baseId?: string
  ): ActionRowBuilder<ButtonBuilder>;
  
  /**
   * Create number buttons (1-9)
   */
  static createNumberButtons(baseId?: string, start?: number, end?: number): ActionRowBuilder<ButtonBuilder>[];
  
  /**
   * Create a select menu
   */
  static createSelectMenu(
    customId: string,
    placeholder: string,
    options: Array<{
      label: string;
      value: string;
      description?: string;
      emoji?: string;
      default?: boolean;
    }>,
    settings?: {
      minValues?: number;
      maxValues?: number;
      disabled?: boolean;
    }
  ): StringSelectMenuBuilder;
  
  /**
   * Create a select menu in an action row
   */
  static createSelectMenuRow(
    customId: string,
    placeholder: string,
    options: Array<{
      label: string;
      value: string;
      description?: string;
      emoji?: string;
      default?: boolean;
    }>,
    settings?: {
      minValues?: number;
      maxValues?: number;
      disabled?: boolean;
    }
  ): ActionRowBuilder<StringSelectMenuBuilder>;
  
  /**
   * Create a modal
   */
  static createModal(
    customId: string,
    title: string,
    inputs: Array<{
      customId: string;
      label: string;
      style: TextInputStyle;
      placeholder?: string;
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      value?: string;
    }>
  ): ModalBuilder;
  
  /**
   * Create a button row
   */
  static createButtonRow(...buttons: ButtonBuilder[]): ActionRowBuilder<ButtonBuilder>;
  
  /**
   * Disable all components in an array
   */
  static disableAllComponents(components: any[]): any[];
  
  /**
   * Create a loading button
   */
  static createLoadingButton(customId?: string, label?: string): ButtonBuilder;
  
  /** Common select menu options */
  static readonly COMMON_OPTIONS: {
    YES_NO: Array<{ label: string; value: string; emoji: string }>;
    NUMBERS_1_10: Array<{ label: string; value: string }>;
  };
}

/**
 * Command builder utilities
 */
export declare class CommandBuilder {
  /**
   * Create a slash command builder
   */
  static createSlashCommand(name: string, description: string): SlashCommandBuilder;
  
  /**
   * Create a user context menu
   */
  static createUserContextMenu(name: string): any;
  
  /**
   * Create a message context menu
   */
  static createMessageContextMenu(name: string): any;
  
  /**
   * Add common options to a command
   */
  static addCommonOptions(builder: SlashCommandBuilder, options?: {
    addUser?: boolean;
    addChannel?: boolean;
    addRole?: boolean;
  }): SlashCommandBuilder;
  
  /**
   * Create a subcommand group
   */
  static createSubcommandGroup(
    builder: SlashCommandBuilder,
    name: string,
    description: string
  ): SlashCommandBuilder;
  
  /**
   * Add a string option
   */
  static addStringOption(
    builder: SlashCommandBuilder,
    name: string,
    description: string,
    options?: {
      required?: boolean;
      choices?: Array<{ name: string; value: string }>;
      autocomplete?: boolean;
      minLength?: number;
      maxLength?: number;
    }
  ): SlashCommandBuilder;
  
  /**
   * Add an integer option
   */
  static addIntegerOption(
    builder: SlashCommandBuilder,
    name: string,
    description: string,
    options?: {
      required?: boolean;
      choices?: Array<{ name: string; value: number }>;
      minValue?: number;
      maxValue?: number;
    }
  ): SlashCommandBuilder;
  
  /**
   * Add a boolean option
   */
  static addBooleanOption(
    builder: SlashCommandBuilder,
    name: string,
    description: string,
    required?: boolean
  ): SlashCommandBuilder;
  
  /**
   * Add a user option
   */
  static addUserOption(
    builder: SlashCommandBuilder,
    name: string,
    description: string,
    required?: boolean
  ): SlashCommandBuilder;
  
  /**
   * Add a channel option
   */
  static addChannelOption(
    builder: SlashCommandBuilder,
    name: string,
    description: string,
    options?: {
      required?: boolean;
      channelTypes?: ChannelType[];
    }
  ): SlashCommandBuilder;
  
  /**
   * Add a role option
   */
  static addRoleOption(
    builder: SlashCommandBuilder,
    name: string,
    description: string,
    required?: boolean
  ): SlashCommandBuilder;
  
  /**
   * Add an attachment option
   */
  static addAttachmentOption(
    builder: SlashCommandBuilder,
    name: string,
    description: string,
    required?: boolean
  ): SlashCommandBuilder;
  
  /** Common permission presets */
  static readonly PERMISSIONS: {
    ADMIN: PermissionResolvable[];
    MODERATOR: PermissionResolvable[];
    EVERYONE: PermissionResolvable[];
  };
  
  /** Common channel types */
  static readonly CHANNEL_TYPES: {
    TEXT: ChannelType[];
    VOICE: ChannelType[];
    ALL: ChannelType[];
  };
}

// ============================================================================
// Logger
// ============================================================================

/**
 * Enhanced logger with multiple log levels
 */
export declare class EnhancedLogger {
  constructor(logger: any, context?: string);
  
  /**
   * Log info message
   */
  info(message: string, meta?: any): void;
  
  /**
   * Log error message
   */
  error(message: string, error?: any): void;
  
  /**
   * Log warning message
   */
  warn(message: string, meta?: any): void;
  
  /**
   * Log debug message
   */
  debug(message: string, meta?: any): void;
  
  /**
   * Log verbose message
   */
  verbose(message: string, meta?: any): void;
  
  /**
   * Log performance metric
   */
  performance(operation: string, duration: number, meta?: any): void;
  
  /**
   * Log command execution
   */
  command(commandName: string, userId: string, guildId?: string): void;
  
  /**
   * Create a child logger with context
   */
  createChild(context: string): EnhancedLogger;
}

/** Global logger instance */
export declare const Logger: EnhancedLogger;

/** Client logger instance */
export declare const Clientlogger: any;

// ============================================================================
// Re-exports
// ============================================================================

export { ClientHandler };
