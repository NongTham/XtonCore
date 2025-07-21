import { Client, AutocompleteInteraction } from 'discord.js';
import { LocalCommand, ValidationFunction } from './dev';
import { getFolderPaths, getFilePaths } from './utils/getPaths';
import { buildCommandTree } from './utils/buildCommandTree';
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

interface ClientHandlerOptions {
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

    if (this._validationsPath && !commandsPath) {
      throw new Error(
        'Command validations are only available in the presence of a commands path. Either add "commandsPath" or remove "validationsPath"'
      );
    }
  }

  private async _initialize(): Promise<void> {
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

    // Initialize all managers
    await this._initializeManagers();

    if (this._commandsPath) {
      await this._commandsInit();
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

    if (this._eventsPath) {
      await this._eventsInit();
    }

    // Setup hot reload if enabled
    this._setupHotReload();
  }

  private async _initializeManagers(): Promise<void> {
    try {
      // Initialize component manager
      if (this._componentsPath) {
        await this._componentManager.initialize();
      }

      this._logger.info("Enhanced managers initialized successfully");
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
    const commandArray = await buildCommandTree(this._commandsPath);
    this._commands = commandArray;
    this._commandsMap.clear();
    for (const cmd of commandArray) {
      if (cmd.name) {
        this._commandsMap.set(cmd.name, cmd);
      }
    }
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
    const eventPaths = await getFolderPaths(this._eventsPath); // สมมติว่า getFolderPaths คืนค่าถูกต้อง

    for (const eventPath of eventPaths) {
      const eventName = path.basename(eventPath);
      const eventFuncPaths = await getFilePaths(eventPath, true);
      eventFuncPaths.sort();

      if (!eventName) continue;

      this._client.on(eventName, async (...args) => {
        for (const eventFuncPath of eventFuncPaths) {
          try {
            const absolutePath = path.resolve(eventFuncPath);
            const fileURL = pathToFileURL(absolutePath).href; // <--- แก้ไขตรงนี้
            const eventModule = await import(fileURL);
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

        // Execute command
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
        this._logger.command(command.name, userId, guildId);

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

    this._logger.info('Manually reloading commands...');
    await this._commandsInit();
    this._registerSlashCommands();
    this._logger.info('Commands reloaded successfully');
  }

  public async reloadComponents(): Promise<void> {
    if (!this._componentsPath) {
      throw new Error('No components path configured');
    }

    this._logger.info('Manually reloading components...');
    await this._componentManager.initialize();
    this._logger.info('Components reloaded successfully');
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