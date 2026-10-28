import {
  ComponentManager,
  CooldownManager,
  HotReloadManager,
  JobManager,
  LanguageManager,
  MemoryAdapter,
  MiddlewareManager,
  PerformanceManager,
  PermissionManager,
  RateLimiter,
  getFilePaths,
  getFolderPaths
} from "./chunk-EAZA32FP.mjs";
import {
  CommandBuilder,
  ComponentHelpers,
  EnhancedEmbedBuilder,
  InputSanitizer,
  PaginationBuilder
} from "./chunk-OVHQI3WN.mjs";
import {
  Clientlogger,
  Logger,
  __require,
  dist_default
} from "./chunk-BEQYUVIL.mjs";

// src/utils/buildCommandTree.ts
import path from "path";
async function buildCommandTree(commandsDir) {
  const commandTree = [];
  if (!commandsDir) return [];
  const commandFilePaths = await getFilePaths(commandsDir, true);
  for (const commandFilePath of commandFilePaths) {
    try {
      const absolutePath = path.resolve(commandFilePath);
      delete __require.cache[__require.resolve(absolutePath)];
      const commandModule = __require(absolutePath);
      let { data, run, deleted, ...rest } = commandModule.default || commandModule;
      if (!data) throw new Error(`File ${commandFilePath} must export "data".`);
      if (!run) throw new Error(`File ${commandFilePath} must export a "run" function.`);
      if (!data.name) throw new Error(`File ${commandFilePath} must have a command name.`);
      if (!data.description) throw new Error(`File ${commandFilePath} must have a command description.`);
      try {
        data = data.toJSON ? data.toJSON() : data;
      } catch (error) {
      }
      commandTree.push({
        ...data,
        ...rest,
        deleted,
        run
      });
    } catch (error) {
      console.error(`[XtonCoreBuilder] Error loading command from ${commandFilePath}:`, error);
    }
  }
  return commandTree;
}

// src/utils/buildCommandTreeLazy.ts
import path2 from "path";
async function buildCommandTreeLazy(commandsDir) {
  const commandTree = [];
  if (!commandsDir) return [];
  const startTime = Date.now();
  const commandFilePaths = await getFilePaths(commandsDir, true);
  for (const commandFilePath of commandFilePaths) {
    try {
      const absolutePath = path2.resolve(commandFilePath);
      delete __require.cache[__require.resolve(absolutePath)];
      const metadata = await loadCommandMetadata(absolutePath);
      if (!metadata) continue;
      const lazyCommand = {
        ...metadata,
        _loaded: false,
        _filePath: absolutePath
      };
      commandTree.push(lazyCommand);
    } catch (error) {
      console.error(`[LazyLoader] Error loading metadata from ${commandFilePath}:`, error);
    }
  }
  const loadTime = Date.now() - startTime;
  console.log(`[LazyLoader] Loaded ${commandTree.length} command metadata in ${loadTime}ms`);
  return commandTree;
}
async function loadCommandMetadata(filePath) {
  try {
    const commandModule = __require(filePath);
    const { data, deleted, cooldown, permissions, aliases, category, ownerOnly, guildOnly, nsfw, customData, ...rest } = commandModule.default || commandModule;
    if (!data) {
      console.warn(`[LazyLoader] File ${filePath} missing "data" export`);
      return null;
    }
    const commandData = data.toJSON ? data.toJSON() : data;
    if (!commandData.name || !commandData.description) {
      console.warn(`[LazyLoader] File ${filePath} missing name or description`);
      return null;
    }
    return {
      ...commandData,
      ...rest,
      filePath,
      deleted,
      cooldown,
      permissions,
      aliases,
      category,
      ownerOnly,
      guildOnly,
      nsfw,
      customData
    };
  } catch (error) {
    console.error(`[LazyLoader] Error loading metadata from ${filePath}:`, error);
    return null;
  }
}
async function loadCommandFunction(command) {
  if (command._loaded) return;
  try {
    const startTime = Date.now();
    delete __require.cache[__require.resolve(command._filePath)];
    const commandModule = __require(command._filePath);
    const { run, autocomplete } = commandModule.default || commandModule;
    if (!run) {
      throw new Error(`Command ${command.name} missing "run" function`);
    }
    command.run = run;
    command.autocomplete = autocomplete;
    command._loaded = true;
    const loadTime = Date.now() - startTime;
    console.log(`[LazyLoader] Loaded function for "${command.name}" in ${loadTime}ms`);
  } catch (error) {
    console.error(`[LazyLoader] Error loading function for ${command.name}:`, error);
    throw error;
  }
}
async function preloadCommands(commands, commandNames) {
  const startTime = Date.now();
  const preloadTasks = [];
  for (const command of commands) {
    if (commandNames.includes(command.name)) {
      preloadTasks.push(loadCommandFunction(command));
    }
  }
  await Promise.all(preloadTasks);
  const loadTime = Date.now() - startTime;
  console.log(`[LazyLoader] Preloaded ${commandNames.length} commands in ${loadTime}ms`);
}
async function preloadAllCommands(commands) {
  const startTime = Date.now();
  const preloadTasks = commands.map((cmd) => loadCommandFunction(cmd));
  await Promise.all(preloadTasks);
  const loadTime = Date.now() - startTime;
  console.log(`[LazyLoader] Preloaded all ${commands.length} commands in ${loadTime}ms`);
}

// src/utils/getAppCommands.ts
async function getAppCommands(client, guildId) {
  let applicationCommands;
  if (guildId) {
    const guild = await client.guilds.fetch(guildId);
    applicationCommands = guild.commands;
  } else {
    applicationCommands = await client.application.commands;
  }
  await applicationCommands.fetch();
  return applicationCommands;
}

// src/utils/areCommandsDifferent.ts
function normalize(command) {
  const keys = [
    "name",
    "name_localizations",
    "description",
    "description_localizations",
    "default_member_permissions",
    "dm_permission",
    "nsfw",
    "type",
    "options"
  ];
  return JSON.stringify(Object.fromEntries(keys.map((key) => [key, command[key] ?? null])));
}
function areCommandsDifferent(existingCommand, localCommand) {
  return normalize(existingCommand) !== normalize(localCommand);
}

// src/utils/registerCommands.ts
async function registerCommands({
  client,
  commands: localCommands,
  guild
}) {
  const applicationCommands = await getAppCommands(client, guild);
  for (const localCommand of localCommands) {
    const {
      name,
      name_localizations,
      description,
      description_localizations,
      default_member_permissions,
      dm_permission,
      options
    } = localCommand;
    const existingCommand = applicationCommands.cache.find((cmd) => cmd.name === name);
    const commandPayload = {
      name,
      name_localizations,
      description,
      description_localizations,
      default_member_permissions,
      dm_permission,
      nsfw: localCommand.nsfw,
      type: localCommand.type,
      options
    };
    if (existingCommand) {
      if (localCommand.deleted) {
        await applicationCommands.delete(existingCommand.id);
        let message = `\u{1F5D1} Deleted command "${name}".`;
        Clientlogger.info(message);
        continue;
      }
      if (areCommandsDifferent(existingCommand, commandPayload)) {
        await applicationCommands.edit(existingCommand.id, commandPayload);
        let message = `\u{1F501} Edited command "${name}".`;
        Clientlogger.info(message);
      }
    } else {
      if (localCommand.deleted) {
        let message2 = `\u23E9 Skipping registering command "${name}" as it's set to delete.`;
        Clientlogger.info(message2);
        continue;
      }
      await applicationCommands.create(commandPayload);
      let message = `\u2705 Registered command "${name}".`;
      Clientlogger.info(message);
    }
  }
}

// src/index.ts
import { pathToFileURL } from "url";
import figlet from "figlet";
import path3 from "path";
var ClientHandler = class _ClientHandler {
  _client;
  _commandsPath;
  _eventsPath;
  _validationsPath;
  _componentsPath;
  _guild;
  _options;
  _validationFuncs;
  _commands;
  _commandsMap;
  // Enhanced managers
  _performanceManager;
  _cooldownManager;
  _componentManager;
  _permissionManager;
  _rateLimiter;
  _hotReloadManager;
  _middlewareManager;
  _jobManager;
  _languageManager;
  _logger;
  _eventListeners = /* @__PURE__ */ new Map();
  static async create(options) {
    const handler = new _ClientHandler(options);
    await handler._initialize();
    return handler;
  }
  constructor(options) {
    const {
      client,
      commandsPath,
      eventsPath,
      validationsPath,
      componentsPath,
      jobsPath,
      localesPath,
      defaultLocale,
      guild,
      ownerIds = [],
      enableHotReload = process.env.NODE_ENV === "development",
      lazyLoading = true,
      // ⚡ Lazy loading enabled by default
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
    this._options = {
      ...options,
      rateLimiting,
      performance,
      preloadCommands: preloadCommandsList
    };
    this._commands = [];
    this._commandsMap = /* @__PURE__ */ new Map();
    this._validationFuncs = [];
    this._logger = Logger.createChild("ClientHandler");
    this._performanceManager = new PerformanceManager();
    this._cooldownManager = new CooldownManager(options.storageAdapter);
    this._componentManager = new ComponentManager(client, componentsPath);
    this._permissionManager = new PermissionManager(ownerIds);
    this._rateLimiter = new RateLimiter(
      rateLimiting.defaultLimit,
      rateLimiting.defaultWindow,
      options.storageAdapter
    );
    this._hotReloadManager = new HotReloadManager(enableHotReload);
    this._middlewareManager = new MiddlewareManager();
    if (jobsPath) {
      this._jobManager = new JobManager(jobsPath, client, this);
    }
    if (localesPath) {
      this._languageManager = new LanguageManager({ localesPath, defaultLocale });
    }
    this._componentManager.setClientHandler(this);
    if (this._validationsPath && !commandsPath) {
      throw new Error(
        'Command validations are only available in the presence of a commands path. Either add "commandsPath" or remove "validationsPath"'
      );
    }
  }
  async _initialize() {
    const startTime = Date.now();
    try {
      if (this._options.storageAdapter?.connect) {
        await this._options.storageAdapter.connect();
      }
      const figletData = await new Promise((resolve, reject) => {
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
        console.log(dist_default.rainbow(figletData));
      }
      this._logger.info("XtonCore Enhanced v3.0.1 is Starting...");
    } catch (error) {
      this._logger.warn("Could not display startup banner.");
    }
    const initTasks = [];
    initTasks.push(this._initializeManagers());
    initTasks.push(this._performanceManager.waitUntilReady());
    if (this._commandsPath) {
      initTasks.push(this._commandsInit());
    }
    if (this._eventsPath) {
      initTasks.push(this._eventsInit());
    }
    if (this._jobManager) {
      initTasks.push(this._jobManager.loadJobs().then());
    }
    if (this._languageManager) {
      initTasks.push(this._languageManager.loadLocales().then());
    }
    await Promise.all(initTasks);
    const loadTime = Date.now() - startTime;
    this._logger.info(`\u26A1 Parallel loading completed in ${loadTime}ms`);
    if (this._commandsPath) {
      this._client.once("ready", async () => {
        await this._registerSlashCommands();
        if (this._validationsPath) {
          await this._validationsInit();
        }
        this._handleCommands();
        this._handleAutocomplete();
        this._logger.info("All systems initialized successfully!");
      });
    }
    this._setupHotReload();
  }
  async _initializeManagers() {
    try {
      const startTime = Date.now();
      if (this._componentsPath) {
        await this._componentManager.initialize();
      }
      const loadTime = Date.now() - startTime;
      this._logger.debug(`Enhanced managers initialized in ${loadTime}ms`);
    } catch (error) {
      this._logger.error("Error initializing managers:", error);
    }
  }
  _setupHotReload() {
    if (!this._hotReloadManager.isEnabled()) return;
    if (this._commandsPath) {
      this._hotReloadManager.watchDirectory(this._commandsPath, async (filePath) => {
        this._logger.info(`Reloading commands due to change in ${filePath}`);
        await this._commandsInit();
        await this._registerSlashCommands();
      });
    }
    if (this._eventsPath) {
      this._hotReloadManager.watchDirectory(this._eventsPath, async (filePath) => {
        this._logger.info(`Reloading events due to change in ${filePath}`);
        this._logger.warn("Event changes detected. Consider restarting for full reload.");
      });
    }
    if (this._componentsPath) {
      this._hotReloadManager.watchDirectory(this._componentsPath, async (filePath) => {
        this._logger.info(`Reloading components due to change in ${filePath}`);
        await this._componentManager.initialize();
      });
    }
  }
  async _commandsInit() {
    const startTime = Date.now();
    const lazyLoading = this._options.lazyLoading !== false;
    let commandArray;
    if (lazyLoading) {
      this._logger.info("\u26A1 Using lazy loading for commands...");
      commandArray = await buildCommandTreeLazy(this._commandsPath);
      if (this._options.preloadCommands && this._options.preloadCommands.length > 0) {
        await preloadCommands(commandArray, this._options.preloadCommands);
      }
    } else {
      this._logger.info("Loading all commands (lazy loading disabled)...");
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
    const loadType = lazyLoading ? "metadata" : "commands";
    this._logger.debug(`Loaded ${commandArray.length} ${loadType} in ${loadTime}ms`);
  }
  async _registerSlashCommands() {
    await registerCommands({
      client: this._client,
      commands: this._commands,
      guild: this._guild
    }).catch((error) => {
      Clientlogger.error("Error during slash command registration:", error);
      throw error;
    });
  }
  async _eventsInit() {
    if (!this._eventsPath) return;
    for (const [eventName, listener] of this._eventListeners) {
      this._client.off(eventName, listener);
    }
    this._eventListeners.clear();
    const startTime = Date.now();
    const eventPaths = await getFolderPaths(this._eventsPath);
    let totalEvents = 0;
    for (const eventPath of eventPaths) {
      const eventName = path3.basename(eventPath);
      const eventFuncPaths = await getFilePaths(eventPath, true);
      eventFuncPaths.sort();
      if (!eventName) continue;
      totalEvents += eventFuncPaths.length;
      const listener = async (...args) => {
        for (const eventFuncPath of eventFuncPaths) {
          try {
            const absolutePath = path3.resolve(eventFuncPath);
            delete __require.cache[__require.resolve(absolutePath)];
            const eventModule = __require(absolutePath);
            const eventFunc = eventModule.default || eventModule;
            if (typeof eventFunc === "function") {
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
      };
      this._eventListeners.set(eventName, listener);
      this._client.on(eventName, listener);
    }
    const loadTime = Date.now() - startTime;
    this._logger.debug(`Loaded ${totalEvents} event handlers in ${loadTime}ms`);
  }
  async _validationsInit() {
    if (!this._validationsPath) return;
    this._validationFuncs = [];
    const validationFilePaths = await getFilePaths(this._validationsPath, true);
    validationFilePaths.sort();
    for (const validationFilePath of validationFilePaths) {
      try {
        const absolutePath = path3.resolve(validationFilePath);
        delete __require.cache[__require.resolve(absolutePath)];
        const fileURL = pathToFileURL(absolutePath).href;
        const validationModule = await import(fileURL);
        const validationFunc = validationModule.default || validationModule;
        if (typeof validationFunc !== "function") {
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
  _handleCommands() {
    this._client.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      const command = this._commandsMap.get(interaction.commandName);
      if (!command) return;
      const startTime = Date.now();
      const userId = interaction.user.id;
      const guildId = interaction.guildId;
      try {
        if (this._options.rateLimiting?.enabled) {
          const rateLimit = await this._rateLimiter.checkLimit(userId, "command");
          if (!rateLimit.allowed) {
            const remainingTime = await this._rateLimiter.getRemainingTime(userId, "command");
            await interaction.reply({
              content: `\u23F0 You're being rate limited! Please wait ${remainingTime} seconds before using commands again.`,
              ephemeral: true
            });
            return;
          }
        }
        const permissionCheck = await this._permissionManager.checkPermissions(interaction, command);
        if (!permissionCheck.allowed) {
          await interaction.reply({
            content: `\u274C ${permissionCheck.reason}`,
            ephemeral: true
          });
          return;
        }
        if (command.cooldown && command.cooldown > 0) {
          if (await this._cooldownManager.isOnCooldown(userId, command.name)) {
            const remainingTime = await this._cooldownManager.getRemainingTime(userId, command.name);
            await interaction.reply({
              content: `\u23F3 This command is on cooldown! Please wait ${remainingTime} seconds.`,
              ephemeral: true
            });
            return;
          }
        }
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
        const context = {
          interaction,
          command,
          client: this._client,
          handler: this,
          state: {}
        };
        const passedMiddleware = await this._middlewareManager.execute(context);
        if (!passedMiddleware) return;
        const lazyCommand = command;
        if (lazyCommand._loaded === false && lazyCommand._filePath) {
          this._logger.debug(`\u26A1 Lazy loading function for "${command.name}"...`);
          await loadCommandFunction(lazyCommand);
        }
        if (!command.run) {
          throw new Error(`Command "${command.name}" has no run function`);
        }
        await command.run({
          interaction,
          client: this._client,
          handler: this
        });
        if (command.cooldown && command.cooldown > 0) {
          await this._cooldownManager.setCooldown(userId, command.name, command.cooldown);
        }
        const executionTime = Date.now() - startTime;
        this._performanceManager.recordCommandExecution(command.name, executionTime);
        this._logger.command(command.name, userId, guildId ?? void 0);
      } catch (error) {
        const executionTime = Date.now() - startTime;
        this._performanceManager.recordCommandError(command.name);
        this._logger.error(`Error executing command ${command.name}:`, error);
        try {
          const errorMessage = process.env.NODE_ENV === "development" ? `\u274C Command error: ${error instanceof Error ? error.message : "Unknown error"}` : "\u274C There was an error while executing this command!";
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
  _handleAutocomplete() {
    this._client.on("interactionCreate", async (interaction) => {
      if (!interaction.isAutocomplete()) return;
      const command = this._commandsMap.get(interaction.commandName);
      if (!command) return;
      try {
        if (command._loaded === false && command._filePath) {
          await loadCommandFunction(command);
        }
        if (!command.autocomplete) return;
        await command.autocomplete(interaction);
      } catch (error) {
        this._logger.error(`Error in autocomplete for ${command.name}:`, error);
      }
    });
  }
  // Public getters for accessing managers and data
  get commands() {
    return this._commands;
  }
  get commandMap() {
    return this._commandsMap;
  }
  get client() {
    return this._client;
  }
  get performanceManager() {
    return this._performanceManager;
  }
  get cooldownManager() {
    return this._cooldownManager;
  }
  get componentManager() {
    return this._componentManager;
  }
  get permissionManager() {
    return this._permissionManager;
  }
  get rateLimiter() {
    return this._rateLimiter;
  }
  get hotReloadManager() {
    return this._hotReloadManager;
  }
  get middlewareManager() {
    return this._middlewareManager;
  }
  get jobManager() {
    return this._jobManager;
  }
  get languageManager() {
    return this._languageManager;
  }
  get storageAdapter() {
    return this._options.storageAdapter;
  }
  // Utility methods
  async reloadCommands() {
    if (!this._commandsPath) {
      throw new Error("No commands path configured");
    }
    const startTime = Date.now();
    this._logger.info("Manually reloading commands...");
    await this._commandsInit();
    await this._registerSlashCommands();
    const loadTime = Date.now() - startTime;
    this._logger.info(`Commands reloaded successfully in ${loadTime}ms`);
  }
  async reloadComponents() {
    if (!this._componentsPath) {
      throw new Error("No components path configured");
    }
    const startTime = Date.now();
    this._logger.info("Manually reloading components...");
    await this._componentManager.initialize();
    const loadTime = Date.now() - startTime;
    this._logger.info(`Components reloaded successfully in ${loadTime}ms`);
  }
  /**
   * ⚡ Reload everything in parallel for maximum speed
   */
  async reloadAll() {
    const startTime = Date.now();
    this._logger.info("\u26A1 Reloading all modules in parallel...");
    const reloadTasks = [];
    if (this._commandsPath) {
      reloadTasks.push(
        this._commandsInit().then(async () => {
          await this._registerSlashCommands();
        })
      );
    }
    if (this._componentsPath) {
      reloadTasks.push(this._componentManager.initialize());
    }
    if (this._eventsPath) {
      reloadTasks.push(this._eventsInit());
    }
    await Promise.all(reloadTasks);
    const loadTime = Date.now() - startTime;
    this._logger.info(`\u26A1 All modules reloaded successfully in ${loadTime}ms`);
  }
  /**
   * ⚡ Preload specific commands (useful for frequently used commands)
   * @param commandNames - Array of command names to preload
   */
  async preloadCommands(commandNames) {
    const startTime = Date.now();
    this._logger.info(`\u26A1 Preloading ${commandNames.length} commands...`);
    const lazyCommands = this._commands.filter((cmd) => {
      const lazyCm = cmd;
      return lazyCm._loaded === false && commandNames.includes(cmd.name);
    });
    await preloadCommands(lazyCommands, commandNames);
    const loadTime = Date.now() - startTime;
    this._logger.info(`\u26A1 Preloaded ${commandNames.length} commands in ${loadTime}ms`);
  }
  /**
   * ⚡ Preload all commands (useful for production)
   */
  async preloadAllCommands() {
    const startTime = Date.now();
    this._logger.info("\u26A1 Preloading all commands...");
    const lazyCommands = this._commands.filter((cmd) => {
      const lazyCmd = cmd;
      return lazyCmd._loaded === false;
    });
    if (lazyCommands.length === 0) {
      this._logger.info("All commands already loaded");
      return;
    }
    await preloadAllCommands(lazyCommands);
    const loadTime = Date.now() - startTime;
    this._logger.info(`\u26A1 Preloaded all ${lazyCommands.length} commands in ${loadTime}ms`);
  }
  /**
   * Get lazy loading statistics
   */
  getLazyLoadingStats() {
    const total = this._commands.length;
    const loaded = this._commands.filter((cmd) => {
      const lazyCmd = cmd;
      return lazyCmd._loaded !== false;
    }).length;
    const unloaded = total - loaded;
    const percentage = total > 0 ? Math.round(loaded / total * 100) : 0;
    return { total, loaded, unloaded, percentage };
  }
  async getStats() {
    return {
      commands: this._commands.length,
      performance: this._performanceManager.getPerformanceMetrics(),
      cooldowns: await this._cooldownManager.getCooldownCount(),
      components: this._componentManager.getHandlerCount(),
      permissions: this._permissionManager.getStats(),
      rateLimiter: await this._rateLimiter.getStats(),
      hotReload: this._hotReloadManager.getStats()
    };
  }
  async generateReport() {
    const stats = await this.getStats();
    const performanceReport = this._performanceManager.generateReport();
    let report = `\u{1F680} **XtonCore Enhanced Status Report**

`;
    report += performanceReport + "\n\n";
    report += `\u{1F4CA} **System Stats:**
`;
    report += `\u2022 Commands: ${stats.commands}
`;
    report += `\u2022 Active Cooldowns: ${stats.cooldowns}
`;
    report += `\u2022 Component Handlers: ${stats.components}
`;
    report += `\u2022 Rate Limits: ${stats.rateLimiter.activeLimits} active, ${stats.rateLimiter.blockedLimits} blocked
`;
    report += `\u2022 Hot Reload: ${stats.hotReload.enabled ? "Enabled" : "Disabled"} (${stats.hotReload.watchedDirectories} directories)
`;
    return report;
  }
  // Cleanup method
  destroy() {
    this._logger.info("Shutting down XtonCore Enhanced...");
    const cleanup = [
      this._cooldownManager.destroy(),
      this._rateLimiter.destroy()
    ];
    this._hotReloadManager.destroy();
    if (this._jobManager) {
      this._jobManager.destroy();
    }
    this._performanceManager.destroy();
    this._permissionManager.destroy();
    this._componentManager.destroy();
    for (const [eventName, listener] of this._eventListeners) {
      this._client.off(eventName, listener);
    }
    this._eventListeners.clear();
    void Promise.all(cleanup).then(async () => {
      if (this._options.storageAdapter?.disconnect) {
        await this._options.storageAdapter.disconnect();
      }
    });
    this._logger.info("XtonCore Enhanced shutdown complete");
  }
};
export {
  ClientHandler,
  Clientlogger,
  CommandBuilder,
  ComponentHelpers,
  ComponentManager,
  CooldownManager,
  EnhancedEmbedBuilder,
  HotReloadManager,
  InputSanitizer,
  JobManager,
  LanguageManager,
  Logger,
  MemoryAdapter,
  MiddlewareManager,
  PaginationBuilder,
  PerformanceManager,
  PermissionManager,
  RateLimiter
};
