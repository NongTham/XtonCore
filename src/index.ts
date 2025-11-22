import { Client, AutocompleteInteraction } from 'discord.js';
import { LocalCommand, ValidationFunction } from './dev';
import { getFolderPaths, getFilePaths } from './utils/getPaths';
import { buildCommandTree } from './utils/buildCommandTree';
import { buildCommandTreeLazy, loadCommandFunction, preloadCommands, preloadAllCommands, LazyCommand } from './utils/buildCommandTreeLazy';
import { registerCommands } from './utils/registerCommands';
import { pathToFileURL } from 'node:url';
import { Clientlogger, Logger } from "./logger";
import { PerformanceManager } from './managers/PerformanceManager';
import { CooldownManager } from './managers/CooldownManager';
import { ComponentManager } from './managers/ComponentManager';
import { PermissionManager } from './managers/PermissionManager';
import { RateLimiter } from './managers/RateLimiter';
import { HotReloadManager } from './managers/HotReloadManager';
import gradient from 'gradient-string';
import figlet from 'figlet';
import path from 'path';

// Re-export types and utilities for better DX
export type { LocalCommand, ValidationFunction, CommandRunOptions } from './dev';
export { PerformanceManager } from './managers/PerformanceManager';
export { CooldownManager } from './managers/CooldownManager';
export { ComponentManager } from './managers/ComponentManager';
export { PermissionManager } from './managers/PermissionManager';
export { RateLimiter } from './managers/RateLimiter';
export { HotReloadManager } from './managers/HotReloadManager';
export { EnhancedEmbedBuilder } from './utils/EmbedBuilder';
export { ComponentHelpers } from './utils/ComponentHelpers';
export { InputSanitizer } from './utils/InputSanitizer';
export { CommandBuilder } from './utils/CommandBuilder';
export { Logger, Clientlogger } from './logger';

interface ClientHandlerOptions {
  client: Client;
  commandsPath?: string;
  eventsPath?: string;
  validationsPath?: string;
  componentsPath?: string;
  guild?: string;
  ownerIds?: string[];
  enableHotReload?: boolean;
  /** ⚡ Enable lazy loading for faster startup (default: true) */
  lazyLoading?: boolean;
  /** Commands to preload immediately (useful for frequently used commands) */
  preloadCommands?: string[];
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

export class ClientHandler {
  private readonly _client: Client;
  private readonly _commandsPath: string | undefined;
  private readonly _eventsPath: string | undefined;
  private readonly _validationsPath: string | undefined;
  private readonly _componentsPath: string | undefined;
  private readonly _guild: string | undefined;
  private readonly _options: ClientHandlerOptions;

  private _validationFuncs: Array<ValidationFunction>;
  private _commands: Array<LocalCommand>;
  private _commandsMap: Map<string, LocalCommand>;

  // Enhanced managers
  private _performanceManager: PerformanceManager;
  private _cooldownManager: CooldownManager;
  private _componentManager: ComponentManager;
  private _permissionManager: PermissionManager;
  private _rateLimiter: RateLimiter;
  private _hotReloadManager: HotReloadManager;
  private _logger: typeof Logger;

  public static async create(options: ClientHandlerOptions): Promise<ClientHandler> {
    const handler = new ClientHandler(options);
    await handler._initialize();
    return handler;
  }

  private constructor(options: ClientHandlerOptions) {
    const {
      client,
      commandsPath,
      eventsPath,
      validationsPath,
      componentsPath,
      guild,
      ownerIds = [],
      enableHotReload = process.env.NODE_ENV === 'development',
      lazyLoading = true, // ⚡ Lazy loading enabled by default
      preloadCommands: preloadCommandsList = [],
      rateLimiting = { enabled: true, defaultLimit: 5, defaultWindow: 60 },
      performance = { enabled: true, trackMemory: true }
    } = options;

    if (!client) {
      throw new Error('Property "client" is required when instantiating ClientHandler.');
    }

    this._client = client;
    this._commandsPath = commandsPath;
    this._eventsPath = eventsPath;
    this._validationsPath = validationsPath;
    this._componentsPath = componentsPath;
    this._guild = guild;
    this._options = options;
    this._commands = [];
    this._commandsMap = new Map();
    this._validationFuncs = [];

    // Initialize managers
    this._logger = Logger.createChild('ClientHandler');
    this._performanceManager = new PerformanceManager();
    this._cooldownManager = new CooldownManager();
    this._componentManager = new ComponentManager(client, componentsPath);
    this._permissionManager = new PermissionManager(ownerIds);
    this._rateLimiter = new RateLimiter(
      rateLimiting.defaultLimit,
      rateLimiting.defaultWindow
    );
    this._hotReloadManager = new HotReloadManager(enableHotReload);
    
    // Set the ClientHandler reference in ComponentManager after construction
    this._componentManager.setClientHandler(this);

    if (this._validationsPath && !commandsPath) {
      throw new Error(
        'Command validations are only available in the presence of a commands path. Either add "commandsPath" or remove "validationsPath"'
      );
    }
  }

  private async _initialize(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const figletData: string | undefined = await new Promise((resolve, reject) => {
        figlet("XtonCore", (err, data) => {
          if (err) {
            this._logger.error("Figlet error:", err);
            reject(err);
            return;
          }
          resolve(data);
        });
      });

      if (figletData) {
        console.log(gradient.rainbow(figletData));
      }
      this._logger.info("XtonCore Enhanced v2.0 is Starting...");
    } catch (error) {
      this._logger.warn("Could not display startup banner.");
    }

    // ⚡ PARALLEL LOADING: Load everything at once!
    const initTasks: Promise<void>[] = [];

    // Initialize managers (components)
    initTasks.push(this._initializeManagers());

    // Initialize commands
    if (this._commandsPath) {
      initTasks.push(this._commandsInit());
    }

    // Initialize events
    if (this._eventsPath) {
      initTasks.push(this._eventsInit());
    }

    // Wait for all initialization tasks to complete in parallel
    await Promise.all(initTasks);

    const loadTime = Date.now() - startTime;
    this._logger.info(`⚡ Parallel loading completed in ${loadTime}ms`);

    // Setup command handlers after commands are loaded
    if (this._commandsPath) {
      this._client.once('ready', async () => {
        this._registerSlashCommands();
        if (this._validationsPath) {
          await this._validationsInit();
        }
        this._handleCommands();
        this._handleAutocomplete();
        this._logger.info("All systems initialized successfully!");
      });
    }

    // Setup hot reload if enabled
    this._setupHotReload();
  }

  private async _initializeManagers(): Promise<void> {
    try {
      const startTime = Date.now();
      // Initialize component manager
      if (this._componentsPath) {
        await this._componentManager.initialize();
      }

      const loadTime = Date.now() - startTime;
      this._logger.debug(`Enhanced managers initialized in ${loadTime}ms`);
    } catch (error) {
      this._logger.error("Error initializing managers:", error);
    }
  }

  private _setupHotReload(): void {
    if (!this._hotReloadManager.isEnabled()) return;

    // Watch commands directory
    if (this._commandsPath) {
      this._hotReloadManager.watchDirectory(this._commandsPath, async (filePath) => {
        this._logger.info(`Reloading commands due to change in ${filePath}`);
        await this._commandsInit();
        this._registerSlashCommands();
      });
    }

    // Watch events directory
    if (this._eventsPath) {
      this._hotReloadManager.watchDirectory(this._eventsPath, async (filePath) => {
        this._logger.info(`Reloading events due to change in ${filePath}`);
        // Note: Event reloading requires client restart in most cases
        this._logger.warn("Event changes detected. Consider restarting for full reload.");
      });
    }

    // Watch components directory
    if (this._componentsPath) {
      this._hotReloadManager.watchDirectory(this._componentsPath, async (filePath) => {
        this._logger.info(`Reloading components due to change in ${filePath}`);
        await this._componentManager.initialize();
      });
    }
  }

  private async _commandsInit(): Promise<void> {
    const startTime = Date.now();
    const lazyLoading = this._options.lazyLoading !== false; // Default true
    
    let commandArray: any[];
    
    if (lazyLoading) {
      // ⚡ LAZY LOADING: Load only metadata
      this._logger.info('⚡ Using lazy loading for commands...');
      commandArray = await buildCommandTreeLazy(this._commandsPath);
      
      // Preload specific commands if specified
      if (this._options.preloadCommands && this._options.preloadCommands.length > 0) {
        await preloadCommands(commandArray as LazyCommand[], this._options.preloadCommands);
      }
    } else {
      // Traditional loading: Load everything
      this._logger.info('Loading all commands (lazy loading disabled)...');
      commandArray = await buildCommandTree(this._commandsPath);
    }
    
    this._commands = commandArray;
    this._commandsMap.clear();
    for (const cmd of commandArray) {
      if (cmd.name) {
        this._commandsMap.set(cmd.name, cmd);
      }
    }
    
    const loadTime = Date.now() - startTime;
    const loadType = lazyLoading ? 'metadata' : 'commands';
    this._logger.debug(`Loaded ${commandArray.length} ${loadType} in ${loadTime}ms`);
  }

  private _registerSlashCommands(): void {
    registerCommands({
      client: this._client,
      commands: this._commands,
      guild: this._guild,
    }).catch(error => Clientlogger.error("Error during slash command registration:", error));
  }

  private async _eventsInit(): Promise<void> {
    if (!this._eventsPath) return;
    const startTime = Date.now();
    const eventPaths = await getFolderPaths(this._eventsPath);

    let totalEvents = 0;
    for (const eventPath of eventPaths) {
      const eventName = path.basename(eventPath);
      const eventFuncPaths = await getFilePaths(eventPath, true);
      eventFuncPaths.sort();

      if (!eventName) continue;

      totalEvents += eventFuncPaths.length;

      this._client.on(eventName, async (...args) => {
        for (const eventFuncPath of eventFuncPaths) {
          try {
            const absolutePath = path.resolve(eventFuncPath);
            // Use require for CommonJS compatibility with ts-node
            const eventModule = require(absolutePath);
            const eventFunc = eventModule.default || eventModule;

            if (typeof eventFunc === 'function') {
              const cantRunEvent = await eventFunc(...args, this._client, this);
              if (cantRunEvent) break;
            } else {
              Clientlogger.warn(`Event file ${eventFuncPath} does not export a default function.`);
            }
          } catch (error) {
            if (error instanceof Error) {
              Clientlogger.error(`Error loading event module from ${eventFuncPath}: ${error.message}`, error);
            } else {
              Clientlogger.error(`Error loading event module from ${eventFuncPath}: Unknown error`, error);
            }
          }
        }
      });
    }
    const loadTime = Date.now() - startTime;
    this._logger.debug(`Loaded ${totalEvents} event handlers in ${loadTime}ms`);
  }

  private async _validationsInit(): Promise<void> {
    if (!this._validationsPath) return;
    const validationFilePaths = await getFilePaths(this._validationsPath, true);
    validationFilePaths.sort();

    for (const validationFilePath of validationFilePaths) {
      try {
        const absolutePath = path.resolve(validationFilePath);
        const fileURL = pathToFileURL(absolutePath).href; // <--- แก้ไขตรงนี้
        const validationModule = await import(fileURL);
        const validationFunc = validationModule.default || validationModule;

        if (typeof validationFunc !== 'function') {
          throw new Error(`Validation file ${validationFilePath} must export a function by default.`);
        }
        this._validationFuncs.push(validationFunc);
      } catch (error) {
        if (error instanceof Error) {
          Clientlogger.error(`Error loading validation module from ${validationFilePath}: ${error.message}`, error);
        } else {
          Clientlogger.error(`Error loading validation module from ${validationFilePath}: Unknown error`, error);
        }
      }
    }
  }

  private _handleCommands(): void {
    this._client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this._commandsMap.get(interaction.commandName);
      if (!command) return;

      const startTime = Date.now();
      const userId = interaction.user.id;
      const guildId = interaction.guildId;

      try {
        // Rate limiting check
        if (this._options.rateLimiting?.enabled) {
          const rateLimit = this._rateLimiter.checkLimit(userId, 'command');
          if (!rateLimit.allowed) {
            const remainingTime = this._rateLimiter.getRemainingTime(userId, 'command');
            await interaction.reply({
              content: `⏰ You're being rate limited! Please wait ${remainingTime} seconds before using commands again.`,
              ephemeral: true
            });
            return;
          }
        }

        // Permission checks
        const permissionCheck = await this._permissionManager.checkPermissions(interaction, command);
        if (!permissionCheck.allowed) {
          await interaction.reply({
            content: `❌ ${permissionCheck.reason}`,
            ephemeral: true
          });
          return;
        }

        // Cooldown check
        if (command.cooldown && command.cooldown > 0) {
          if (this._cooldownManager.isOnCooldown(userId, command.name)) {
            const remainingTime = this._cooldownManager.getRemainingTime(userId, command.name);
            await interaction.reply({
              content: `⏳ This command is on cooldown! Please wait ${remainingTime} seconds.`,
              ephemeral: true
            });
            return;
          }
        }

        // Validation checks
        if (this._validationFuncs.length) {
          let canRun = true;
          for (const validationFunc of this._validationFuncs) {
            const cantRunCommand = await Promise.resolve(validationFunc(interaction, command, this, this._client));
            if (cantRunCommand) {
              canRun = false;
              break;
            }
          }
          if (!canRun) return;
        }

        // ⚡ LAZY LOADING: Load command function if not loaded yet
        const lazyCommand = command as unknown as LazyCommand;
        if (lazyCommand._loaded === false && lazyCommand._filePath) {
          this._logger.debug(`⚡ Lazy loading function for "${command.name}"...`);
          await loadCommandFunction(lazyCommand);
        }

        // Execute command
        if (!command.run) {
          throw new Error(`Command "${command.name}" has no run function`);
        }
        
        await command.run({
          interaction,
          client: this._client,
          handler: this,
        });

        // Set cooldown after successful execution
        if (command.cooldown && command.cooldown > 0) {
          this._cooldownManager.setCooldown(userId, command.name, command.cooldown);
        }

        // Record performance metrics
        const executionTime = Date.now() - startTime;
        this._performanceManager.recordCommandExecution(command.name, executionTime);
        this._logger.command(command.name, userId, guildId ?? undefined);

      } catch (error) {
        const executionTime = Date.now() - startTime;
        this._performanceManager.recordCommandError(command.name);
        this._logger.error(`Error executing command ${command.name}:`, error);

        try {
          const errorMessage = process.env.NODE_ENV === 'development'
            ? `❌ Command error: ${error instanceof Error ? error.message : 'Unknown error'}`
            : '❌ There was an error while executing this command!';

          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
          } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
          }
        } catch (followUpError) {
          this._logger.error("Error sending error message to user:", followUpError);
        }
      }
    });
  }

  private _handleAutocomplete(): void {
    this._client.on('interactionCreate', async (interaction) => {
      if (!interaction.isAutocomplete()) return;

      const command = this._commandsMap.get(interaction.commandName);
      if (!command || !command.autocomplete) return;

      try {
        await command.autocomplete(interaction);
      } catch (error) {
        this._logger.error(`Error in autocomplete for ${command.name}:`, error);
      }
    });
  }

  // Public getters for accessing managers and data
  public get commands(): LocalCommand[] {
    return this._commands;
  }

  public get commandMap(): ReadonlyMap<string, LocalCommand> {
    return this._commandsMap;
  }

  public get client(): Client {
    return this._client;
  }

  public get performanceManager(): PerformanceManager {
    return this._performanceManager;
  }

  public get cooldownManager(): CooldownManager {
    return this._cooldownManager;
  }

  public get componentManager(): ComponentManager {
    return this._componentManager;
  }

  public get permissionManager(): PermissionManager {
    return this._permissionManager;
  }

  public get rateLimiter(): RateLimiter {
    return this._rateLimiter;
  }

  public get hotReloadManager(): HotReloadManager {
    return this._hotReloadManager;
  }

  // Utility methods
  public async reloadCommands(): Promise<void> {
    if (!this._commandsPath) {
      throw new Error('No commands path configured');
    }

    const startTime = Date.now();
    this._logger.info('Manually reloading commands...');
    await this._commandsInit();
    this._registerSlashCommands();
    const loadTime = Date.now() - startTime;
    this._logger.info(`Commands reloaded successfully in ${loadTime}ms`);
  }

  public async reloadComponents(): Promise<void> {
    if (!this._componentsPath) {
      throw new Error('No components path configured');
    }

    const startTime = Date.now();
    this._logger.info('Manually reloading components...');
    await this._componentManager.initialize();
    const loadTime = Date.now() - startTime;
    this._logger.info(`Components reloaded successfully in ${loadTime}ms`);
  }

  /**
   * ⚡ Reload everything in parallel for maximum speed
   */
  public async reloadAll(): Promise<void> {
    const startTime = Date.now();
    this._logger.info('⚡ Reloading all modules in parallel...');

    const reloadTasks: Promise<void>[] = [];

    // Reload commands
    if (this._commandsPath) {
      reloadTasks.push(
        this._commandsInit().then(() => {
          this._registerSlashCommands();
        })
      );
    }

    // Reload components
    if (this._componentsPath) {
      reloadTasks.push(this._componentManager.initialize());
    }

    // Reload events (note: may require restart for full effect)
    if (this._eventsPath) {
      reloadTasks.push(this._eventsInit());
    }

    // Wait for all reloads to complete
    await Promise.all(reloadTasks);

    const loadTime = Date.now() - startTime;
    this._logger.info(`⚡ All modules reloaded successfully in ${loadTime}ms`);
  }

  /**
   * ⚡ Preload specific commands (useful for frequently used commands)
   * @param commandNames - Array of command names to preload
   */
  public async preloadCommands(commandNames: string[]): Promise<void> {
    const startTime = Date.now();
    this._logger.info(`⚡ Preloading ${commandNames.length} commands...`);

    const lazyCommands = this._commands.filter(cmd => {
      const lazyCm = cmd as unknown as LazyCommand;
      return lazyCm._loaded === false && commandNames.includes(cmd.name);
    }) as unknown as LazyCommand[];

    await preloadCommands(lazyCommands, commandNames);

    const loadTime = Date.now() - startTime;
    this._logger.info(`⚡ Preloaded ${commandNames.length} commands in ${loadTime}ms`);
  }

  /**
   * ⚡ Preload all commands (useful for production)
   */
  public async preloadAllCommands(): Promise<void> {
    const startTime = Date.now();
    this._logger.info('⚡ Preloading all commands...');

    const lazyCommands = this._commands.filter(cmd => {
      const lazyCmd = cmd as unknown as LazyCommand;
      return lazyCmd._loaded === false;
    }) as unknown as LazyCommand[];

    if (lazyCommands.length === 0) {
      this._logger.info('All commands already loaded');
      return;
    }

    await preloadAllCommands(lazyCommands);

    const loadTime = Date.now() - startTime;
    this._logger.info(`⚡ Preloaded all ${lazyCommands.length} commands in ${loadTime}ms`);
  }

  /**
   * Get lazy loading statistics
   */
  public getLazyLoadingStats(): {
    total: number;
    loaded: number;
    unloaded: number;
    percentage: number;
  } {
    const total = this._commands.length;
    const loaded = this._commands.filter(cmd => {
      const lazyCmd = cmd as unknown as LazyCommand;
      return lazyCmd._loaded !== false;
    }).length;
    const unloaded = total - loaded;
    const percentage = total > 0 ? Math.round((loaded / total) * 100) : 0;

    return { total, loaded, unloaded, percentage };
  }

  public getStats(): {
    commands: number;
    performance: any;
    cooldowns: number;
    components: number;
    permissions: any;
    rateLimiter: any;
    hotReload: any;
  } {
    return {
      commands: this._commands.length,
      performance: this._performanceManager.getPerformanceMetrics(),
      cooldowns: this._cooldownManager.getCooldownCount(),
      components: this._componentManager.getHandlerCount(),
      permissions: this._permissionManager.getStats(),
      rateLimiter: this._rateLimiter.getStats(),
      hotReload: this._hotReloadManager.getStats()
    };
  }

  public generateReport(): string {
    const stats = this.getStats();
    const performanceReport = this._performanceManager.generateReport();

    let report = `🚀 **XtonCore Enhanced Status Report**\n\n`;
    report += performanceReport + '\n\n';
    report += `📊 **System Stats:**\n`;
    report += `• Commands: ${stats.commands}\n`;
    report += `• Active Cooldowns: ${stats.cooldowns}\n`;
    report += `• Component Handlers: ${stats.components}\n`;
    report += `• Rate Limits: ${stats.rateLimiter.activeLimits} active, ${stats.rateLimiter.blockedLimits} blocked\n`;
    report += `• Hot Reload: ${stats.hotReload.enabled ? 'Enabled' : 'Disabled'} (${stats.hotReload.watchedDirectories} directories)\n`;

    return report;
  }

  // Cleanup method
  public destroy(): void {
    this._logger.info('Shutting down XtonCore Enhanced...');

    this._cooldownManager.destroy();
    this._rateLimiter.destroy();
    this._hotReloadManager.destroy();

    this._logger.info('XtonCore Enhanced shutdown complete');
  }
}