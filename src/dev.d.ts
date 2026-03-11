import {
  Client,
  APIApplicationCommand,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  ButtonInteraction,
  SelectMenuInteraction,
  ModalSubmitInteraction,
  AutocompleteInteraction,
  PermissionResolvable,
} from "discord.js";

import { PerformanceManager } from './managers/PerformanceManager';
import { CooldownManager } from './managers/CooldownManager';
import { ComponentManager } from './managers/ComponentManager';
import { PermissionManager } from './managers/PermissionManager';
import { RateLimiter } from './managers/RateLimiter';
import { HotReloadManager } from './managers/HotReloadManager';
import { MiddlewareManager } from './managers/MiddlewareManager';
import { JobManager } from './managers/JobManager';
import { LanguageManager } from './managers/LanguageManager';

export interface MiddlewareContext {
  interaction: ChatInputCommandInteraction;
  command: LocalCommand;
  client: Client;
  handler: ClientHandler;
  /** Custom state to pass data between middlewares */
  state: Record<string, any>;
}

export type NextFunction = (error?: Error) => void | Promise<void>;

export interface MiddlewareFunction {
  (context: MiddlewareContext, next: NextFunction): Promise<void> | void;
}

// Forward declaration for circular dependency
export interface ClientHandler {
  readonly commands: LocalCommand[];
  readonly commandMap: ReadonlyMap<string, LocalCommand>;
  readonly client: Client;
  readonly performanceManager: PerformanceManager;
  readonly cooldownManager: CooldownManager;
  readonly componentManager: ComponentManager;
  readonly permissionManager: PermissionManager;
  readonly rateLimiter: RateLimiter;
  readonly hotReloadManager: HotReloadManager;
  readonly middlewareManager: MiddlewareManager;
  readonly jobManager?: JobManager;
  readonly languageManager?: LanguageManager;

  // Methods
  reloadCommands(): Promise<void>;
  reloadComponents(): Promise<void>;
  reloadAll(): Promise<void>;
  preloadCommands(commandNames: string[]): Promise<void>;
  preloadAllCommands(): Promise<void>;
  getLazyLoadingStats(): {
    total: number;
    loaded: number;
    unloaded: number;
    percentage: number;
  };
  getStats(): Promise<{
    commands: number;
    performance: ReturnType<PerformanceManager['getPerformanceMetrics']>;
    cooldowns: number;
    components: number;
    permissions: ReturnType<PermissionManager['getStats']>;
    rateLimiter: Awaited<ReturnType<RateLimiter['getStats']>>;
    hotReload: ReturnType<HotReloadManager['getStats']>;
  }>;
  generateReport(): Promise<string>;
  destroy(): void;
}

/**
 * Extended command interface with XtonCore features
 * @template TCustomData - Custom data type for extending command properties
 */
export interface LocalCommand<TCustomData = Record<string, any>>
  extends APIApplicationCommand {
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
export interface ComponentHandler<
  TInteraction =
  | ButtonInteraction
  | SelectMenuInteraction
  | ModalSubmitInteraction
> {
  /** Custom ID or regex pattern to match */
  customId: string | RegExp;
  /** Component type */
  type: "button" | "selectMenu" | "modal";
  /** Handler function */
  run: (
    interaction: TInteraction,
    client: Client,
    handler: ClientHandler
  ) => Promise<void>;
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
 * Scheduled cron job
 */
export interface Job {
  /** Name of the job */
  name: string;
  /** Cron expression (e.g. '* * * * *') */
  cron: string;
  /** Whether the job is enabled by default */
  enabled?: boolean;
  /** Execution function */
  run: (client: Client, handler: ClientHandler) => Promise<void> | void;
}
