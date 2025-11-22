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

// Forward declaration for circular dependency
export interface ClientHandler {
  readonly commands: LocalCommand[];
  readonly commandMap: ReadonlyMap<string, LocalCommand>;
  readonly client: Client;
  readonly performanceManager: any;
  readonly cooldownManager: any;
  readonly componentManager: any;
  readonly permissionManager: any;
  readonly rateLimiter: any;
  readonly hotReloadManager: any;
  
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
  getStats(): {
    commands: number;
    performance: any;
    cooldowns: number;
    components: number;
    permissions: any;
    rateLimiter: any;
    hotReload: any;
  };
  generateReport(): string;
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
