// src/utils/getPaths.ts
import fs from "fs/promises";
import path from "path";
async function getFilePaths(directory, nesting) {
  let filePaths = [];
  if (!directory)
    return filePaths;
  try {
    const items = await fs.readdir(directory, { withFileTypes: true });
    for (const item of items) {
      const itemPath = path.join(directory, item.name);
      if (item.isFile()) {
        filePaths.push(itemPath);
      }
      if (nesting && item.isDirectory()) {
        const nestedFiles = await getFilePaths(itemPath, true);
        filePaths = [...filePaths, ...nestedFiles];
      }
    }
  } catch (error) {
    console.error(`[XtonCoreUtils] Error reading directory ${directory}:`, error);
  }
  return filePaths;
}
async function getFolderPaths(directory, nesting) {
  let folderPaths = [];
  if (!directory)
    return folderPaths;
  try {
    const items = await fs.readdir(directory, { withFileTypes: true });
    for (const item of items) {
      const itemPath = path.join(directory, item.name);
      if (item.isDirectory()) {
        folderPaths.push(itemPath);
        if (nesting) {
          const nestedFolders = await getFolderPaths(itemPath, true);
          folderPaths = [...folderPaths, ...nestedFolders];
        }
      }
    }
  } catch (error) {
    console.error(`[XtonCoreUtils] Error reading directory ${directory}:`, error);
  }
  return folderPaths;
}

// src/utils/buildCommandTree.ts
import path2 from "path";
import { pathToFileURL } from "url";
async function buildCommandTree(commandsDir) {
  const commandTree = [];
  if (!commandsDir)
    return [];
  const commandFilePaths = await getFilePaths(commandsDir, true);
  for (const commandFilePath of commandFilePaths) {
    try {
      const absolutePath = path2.resolve(commandFilePath);
      const fileURL = pathToFileURL(absolutePath).href;
      const commandModule = await import(fileURL);
      let { data, run, deleted, ...rest } = commandModule.default || commandModule;
      if (!data)
        throw new Error(`File ${commandFilePath} must export "data".`);
      if (!run)
        throw new Error(`File ${commandFilePath} must export a "run" function.`);
      if (!data.name)
        throw new Error(`File ${commandFilePath} must have a command name.`);
      if (!data.description)
        throw new Error(`File ${commandFilePath} must have a command description.`);
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
function areCommandsDifferent(existingCommand, localCommand) {
  if (localCommand.description !== existingCommand.description || (localCommand.options?.length || 0) !== existingCommand.options?.length) {
    return true;
  } else {
    return false;
  }
}

// src/logger.ts
import { createLogger, format, transports } from "winston";
import fs2 from "fs";
import path3 from "path";
import gradient from "gradient-string";
var logDir = "Logs";
if (!fs2.existsSync(logDir)) {
  fs2.mkdirSync(logDir, { recursive: true });
}
var filename = path3.join(logDir, `Client.log`);
var errorFilename = path3.join(logDir, `Error.log`);
var debugFilename = path3.join(logDir, `Debug.log`);
var Clientlogger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: format.combine(
    format.errors({ stack: true }),
    format.label({ label: path3.basename(process.mainModule?.filename ?? "unknown") }),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.metadata({ fillExcept: ["message", "level", "timestamp", "label"] })
  ),
  transports: [
    // Console transport with colors and gradients
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf((info) => {
          const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
          const timestamp = gradient.rainbow(`${info.timestamp}`);
          const core = gradient.pastel.multiline("XtonCore");
          let message = `[${timestamp}] ${info.level} [${core}] [${info.label}] [${memory}MB] : ${info.message}`;
          if (info.stack) {
            message += `
${info.stack}`;
          }
          return message;
        })
      )
    }),
    // Main log file
    new transports.File({
      filename,
      format: format.combine(
        format.json(),
        format.timestamp()
      ),
      maxsize: 5242880,
      // 5MB
      maxFiles: 5
    }),
    // Error-only log file
    new transports.File({
      filename: errorFilename,
      level: "error",
      format: format.combine(
        format.json(),
        format.timestamp()
      ),
      maxsize: 5242880,
      // 5MB
      maxFiles: 3
    }),
    // Debug log file (only in development)
    ...process.env.NODE_ENV !== "production" ? [
      new transports.File({
        filename: debugFilename,
        level: "debug",
        format: format.combine(
          format.json(),
          format.timestamp()
        ),
        maxsize: 10485760,
        // 10MB
        maxFiles: 2
      })
    ] : []
  ],
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new transports.File({ filename: path3.join(logDir, "exceptions.log") })
  ],
  rejectionHandlers: [
    new transports.File({ filename: path3.join(logDir, "rejections.log") })
  ]
});
var EnhancedLogger = class {
  logger;
  context;
  constructor(logger, context = "XtonCore") {
    this.logger = logger;
    this.context = context;
  }
  formatMessage(message, meta) {
    return meta ? `[${this.context}] ${message} ${JSON.stringify(meta)}` : `[${this.context}] ${message}`;
  }
  info(message, meta) {
    this.logger.info(this.formatMessage(message, meta));
  }
  error(message, error, p0, reason) {
    if (error instanceof Error) {
      this.logger.error(this.formatMessage(message), { error: error.message, stack: error.stack });
    } else {
      this.logger.error(this.formatMessage(message, error));
    }
  }
  warn(message, meta) {
    this.logger.warn(this.formatMessage(message, meta));
  }
  debug(message, meta) {
    this.logger.debug(this.formatMessage(message, meta));
  }
  verbose(message, meta) {
    this.logger.verbose(this.formatMessage(message, meta));
  }
  performance(operation, duration, meta) {
    this.logger.info(this.formatMessage(`Performance: ${operation} took ${duration}ms`, meta));
  }
  command(commandName, userId, guildId) {
    this.logger.info(this.formatMessage(`Command executed: ${commandName}`, {
      userId,
      guildId: guildId || "DM"
    }));
  }
  createChild(context) {
    return new EnhancedLogger(this.logger, `${this.context}:${context}`);
  }
};
var Logger = new EnhancedLogger(Clientlogger);

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
    if (existingCommand) {
      if (localCommand.deleted) {
        await applicationCommands.delete(existingCommand.id);
        let message = `\u{1F5D1} Deleted command "${name}".`;
        Clientlogger.info(message);
        continue;
      }
      if (areCommandsDifferent(existingCommand, localCommand)) {
        await applicationCommands.edit(existingCommand.id, {
          description,
          options
        });
        let message = `\u{1F501} Edited command "${name}".`;
        Clientlogger.info(message);
      }
    } else {
      if (localCommand.deleted) {
        let message2 = `\u23E9 Skipping registering command "${name}" as it's set to delete.`;
        Clientlogger.info(message2);
        continue;
      }
      await applicationCommands.create({
        name,
        name_localizations,
        description,
        description_localizations,
        default_member_permissions,
        dm_permission,
        options
      });
      let message = `\u2705 Registered command "${name}".`;
      Clientlogger.info(message);
    }
  }
}

// src/index.ts
import { pathToFileURL as pathToFileURL3 } from "url";

// src/managers/PerformanceManager.ts
import fs3 from "fs/promises";
import path4 from "path";
var PerformanceManager = class {
  metrics;
  commandStats;
  startTime;
  statsFile;
  constructor() {
    this.startTime = Date.now();
    this.statsFile = path4.join(process.cwd(), "stats", "command-stats.json");
    this.metrics = {
      commandExecutions: /* @__PURE__ */ new Map(),
      commandErrors: /* @__PURE__ */ new Map(),
      commandTimes: /* @__PURE__ */ new Map(),
      memoryUsage: [],
      uptime: 0
    };
    this.commandStats = /* @__PURE__ */ new Map();
    this.initializeStatsDirectory();
    this.loadStats();
    this.startMemoryMonitoring();
  }
  async initializeStatsDirectory() {
    try {
      await fs3.mkdir(path4.dirname(this.statsFile), { recursive: true });
    } catch (error) {
      Clientlogger.error("Failed to create stats directory:", error);
    }
  }
  async loadStats() {
    try {
      const data = await fs3.readFile(this.statsFile, "utf-8");
      const savedStats = JSON.parse(data);
      for (const [name, stats] of Object.entries(savedStats)) {
        this.commandStats.set(name, {
          ...stats,
          lastUsed: new Date(stats.lastUsed)
        });
      }
      Clientlogger.info(`Loaded stats for ${this.commandStats.size} commands`);
    } catch (error) {
      Clientlogger.info("No existing stats file found, starting fresh");
    }
  }
  async saveStats() {
    try {
      const statsObject = Object.fromEntries(this.commandStats);
      await fs3.writeFile(this.statsFile, JSON.stringify(statsObject, null, 2));
    } catch (error) {
      Clientlogger.error("Failed to save stats:", error);
    }
  }
  startMemoryMonitoring() {
    setInterval(() => {
      const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;
      this.metrics.memoryUsage.push(memUsage);
      if (this.metrics.memoryUsage.length > 100) {
        this.metrics.memoryUsage.shift();
      }
      this.metrics.uptime = Date.now() - this.startTime;
    }, 3e4);
    setInterval(() => {
      this.saveStats();
    }, 3e5);
  }
  recordCommandExecution(commandName, executionTime) {
    this.metrics.commandExecutions.set(
      commandName,
      (this.metrics.commandExecutions.get(commandName) || 0) + 1
    );
    const times = this.metrics.commandTimes.get(commandName) || [];
    times.push(executionTime);
    if (times.length > 50)
      times.shift();
    this.metrics.commandTimes.set(commandName, times);
    const stats = this.commandStats.get(commandName) || {
      name: commandName,
      uses: 0,
      errors: 0,
      lastUsed: /* @__PURE__ */ new Date(),
      averageExecutionTime: 0
    };
    stats.uses++;
    stats.lastUsed = /* @__PURE__ */ new Date();
    stats.averageExecutionTime = times.reduce((a, b) => a + b, 0) / times.length;
    this.commandStats.set(commandName, stats);
  }
  recordCommandError(commandName) {
    this.metrics.commandErrors.set(
      commandName,
      (this.metrics.commandErrors.get(commandName) || 0) + 1
    );
    const stats = this.commandStats.get(commandName);
    if (stats) {
      stats.errors++;
      this.commandStats.set(commandName, stats);
    }
  }
  getCommandStats(commandName) {
    if (commandName) {
      return this.commandStats.get(commandName) || null;
    }
    return Array.from(this.commandStats.values());
  }
  getTopCommands(limit = 10) {
    return Array.from(this.commandStats.values()).sort((a, b) => b.uses - a.uses).slice(0, limit);
  }
  getPerformanceMetrics() {
    return { ...this.metrics };
  }
  getMemoryUsage() {
    const current = process.memoryUsage().heapUsed / 1024 / 1024;
    const average = this.metrics.memoryUsage.reduce((a, b) => a + b, 0) / this.metrics.memoryUsage.length || 0;
    const peak = Math.max(...this.metrics.memoryUsage, current);
    return { current, average, peak };
  }
  generateReport() {
    const topCommands = this.getTopCommands(5);
    const memory = this.getMemoryUsage();
    const uptime = Math.floor((Date.now() - this.startTime) / 1e3);
    let report = `\u{1F4CA} **Performance Report**
`;
    report += `\u23F1\uFE0F Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor(uptime % 3600 / 60)}m
`;
    report += `\u{1F4BE} Memory: ${memory.current.toFixed(2)}MB (avg: ${memory.average.toFixed(2)}MB, peak: ${memory.peak.toFixed(2)}MB)

`;
    report += `\u{1F3C6} **Top Commands:**
`;
    topCommands.forEach((cmd, i) => {
      report += `${i + 1}. ${cmd.name}: ${cmd.uses} uses (${cmd.averageExecutionTime.toFixed(2)}ms avg)
`;
    });
    return report;
  }
};

// src/managers/CooldownManager.ts
var CooldownManager = class {
  cooldowns;
  cleanupInterval;
  constructor() {
    this.cooldowns = /* @__PURE__ */ new Map();
    this.startCleanup();
  }
  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.cooldowns.entries()) {
        if (data.expiresAt <= now) {
          this.cooldowns.delete(key);
        }
      }
    }, 6e4);
  }
  getCooldownKey(userId, commandName) {
    return `${userId}-${commandName}`;
  }
  setCooldown(userId, commandName, duration) {
    const key = this.getCooldownKey(userId, commandName);
    const expiresAt = Date.now() + duration * 1e3;
    this.cooldowns.set(key, {
      userId,
      commandName,
      expiresAt
    });
    Clientlogger.debug(`Set cooldown for user ${userId} on command ${commandName} for ${duration}s`);
  }
  getCooldown(userId, commandName) {
    const key = this.getCooldownKey(userId, commandName);
    const cooldown = this.cooldowns.get(key);
    if (!cooldown)
      return null;
    if (cooldown.expiresAt <= Date.now()) {
      this.cooldowns.delete(key);
      return null;
    }
    return cooldown;
  }
  getRemainingTime(userId, commandName) {
    const cooldown = this.getCooldown(userId, commandName);
    if (!cooldown)
      return 0;
    return Math.max(0, Math.ceil((cooldown.expiresAt - Date.now()) / 1e3));
  }
  isOnCooldown(userId, commandName) {
    return this.getCooldown(userId, commandName) !== null;
  }
  removeCooldown(userId, commandName) {
    const key = this.getCooldownKey(userId, commandName);
    return this.cooldowns.delete(key);
  }
  clearUserCooldowns(userId) {
    let cleared = 0;
    for (const [key, data] of this.cooldowns.entries()) {
      if (data.userId === userId) {
        this.cooldowns.delete(key);
        cleared++;
      }
    }
    return cleared;
  }
  getAllCooldowns() {
    return Array.from(this.cooldowns.values());
  }
  getCooldownCount() {
    return this.cooldowns.size;
  }
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cooldowns.clear();
  }
};

// src/managers/ComponentManager.ts
import { pathToFileURL as pathToFileURL2 } from "url";
import path5 from "path";
var ComponentManager = class {
  client;
  handlers;
  componentsPath;
  constructor(client, componentsPath) {
    this.client = client;
    this.handlers = [];
    this.componentsPath = componentsPath;
  }
  async initialize() {
    if (this.componentsPath) {
      await this.loadComponents();
    }
    this.setupEventListeners();
    Clientlogger.info(`Component Manager initialized with ${this.handlers.length} handlers`);
  }
  async loadComponents() {
    if (!this.componentsPath)
      return;
    try {
      const componentFiles = await getFilePaths(this.componentsPath, true);
      for (const filePath of componentFiles) {
        try {
          const absolutePath = path5.resolve(filePath);
          const fileURL = pathToFileURL2(absolutePath).href;
          const componentModule = await import(fileURL);
          const handler = componentModule.default || componentModule;
          if (this.isValidHandler(handler)) {
            this.handlers.push(handler);
            Clientlogger.debug(`Loaded component handler: ${handler.customId}`);
          } else {
            Clientlogger.warn(`Invalid component handler in ${filePath}`);
          }
        } catch (error) {
          Clientlogger.error(`Error loading component from ${filePath}:`, error);
        }
      }
    } catch (error) {
      Clientlogger.error("Error loading components:", error);
    }
  }
  isValidHandler(handler) {
    return handler && (typeof handler.customId === "string" || handler.customId instanceof RegExp) && ["button", "selectMenu", "modal"].includes(handler.type) && typeof handler.run === "function";
  }
  setupEventListeners() {
    this.client.on("interactionCreate", async (interaction) => {
      if (interaction.isButton()) {
        await this.handleButtonInteraction(interaction);
      } else if (interaction.isSelectMenu()) {
        await this.handleSelectMenuInteraction(interaction);
      } else if (interaction.isModalSubmit()) {
        await this.handleModalInteraction(interaction);
      }
    });
  }
  async handleButtonInteraction(interaction) {
    const handler = this.findHandler(interaction.customId, "button");
    if (handler) {
      try {
        await handler.run(interaction, this.client, this);
      } catch (error) {
        Clientlogger.error(`Error executing button handler for ${interaction.customId}:`, error);
        await this.handleInteractionError(interaction, error);
      }
    }
  }
  async handleSelectMenuInteraction(interaction) {
    const handler = this.findHandler(interaction.customId, "selectMenu");
    if (handler) {
      try {
        await handler.run(interaction, this.client, this);
      } catch (error) {
        Clientlogger.error(`Error executing select menu handler for ${interaction.customId}:`, error);
        await this.handleInteractionError(interaction, error);
      }
    }
  }
  async handleModalInteraction(interaction) {
    const handler = this.findHandler(interaction.customId, "modal");
    if (handler) {
      try {
        await handler.run(interaction, this.client, this);
      } catch (error) {
        Clientlogger.error(`Error executing modal handler for ${interaction.customId}:`, error);
        await this.handleInteractionError(interaction, error);
      }
    }
  }
  findHandler(customId, type) {
    return this.handlers.find((handler) => {
      if (handler.type !== type)
        return false;
      if (typeof handler.customId === "string") {
        return handler.customId === customId;
      } else if (handler.customId instanceof RegExp) {
        return handler.customId.test(customId);
      }
      return false;
    }) || null;
  }
  async handleInteractionError(interaction, error) {
    const errorMessage = "There was an error while processing this interaction!";
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    } catch (followUpError) {
      Clientlogger.error("Failed to send error message to user:", followUpError);
    }
  }
  addHandler(handler) {
    if (this.isValidHandler(handler)) {
      this.handlers.push(handler);
      Clientlogger.debug(`Added component handler: ${handler.customId}`);
    } else {
      throw new Error("Invalid component handler");
    }
  }
  removeHandler(customId, type) {
    const index = this.handlers.findIndex(
      (handler) => handler.customId === customId && handler.type === type
    );
    if (index !== -1) {
      this.handlers.splice(index, 1);
      Clientlogger.debug(`Removed component handler: ${customId}`);
      return true;
    }
    return false;
  }
  getHandlers() {
    return [...this.handlers];
  }
  getHandlerCount() {
    return this.handlers.length;
  }
};

// src/managers/PermissionManager.ts
import {
  GuildMember,
  PermissionsBitField
} from "discord.js";
var PermissionManager = class {
  ownerIds;
  blacklistedUsers;
  blacklistedGuilds;
  permissionCache;
  constructor(ownerIds = []) {
    this.ownerIds = new Set(ownerIds);
    this.blacklistedUsers = /* @__PURE__ */ new Set();
    this.blacklistedGuilds = /* @__PURE__ */ new Set();
    this.permissionCache = /* @__PURE__ */ new Map();
    this.startCacheCleanup();
  }
  startCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.permissionCache.entries()) {
        if (data.expiresAt <= now) {
          this.permissionCache.delete(key);
        }
      }
    }, 3e5);
  }
  addOwner(userId) {
    this.ownerIds.add(userId);
    Clientlogger.info(`Added owner: ${userId}`);
  }
  removeOwner(userId) {
    const removed = this.ownerIds.delete(userId);
    if (removed) {
      Clientlogger.info(`Removed owner: ${userId}`);
    }
    return removed;
  }
  isOwner(userId) {
    return this.ownerIds.has(userId);
  }
  blacklistUser(userId) {
    this.blacklistedUsers.add(userId);
    Clientlogger.info(`Blacklisted user: ${userId}`);
  }
  unblacklistUser(userId) {
    const removed = this.blacklistedUsers.delete(userId);
    if (removed) {
      Clientlogger.info(`Removed user from blacklist: ${userId}`);
    }
    return removed;
  }
  isUserBlacklisted(userId) {
    return this.blacklistedUsers.has(userId);
  }
  blacklistGuild(guildId) {
    this.blacklistedGuilds.add(guildId);
    Clientlogger.info(`Blacklisted guild: ${guildId}`);
  }
  unblacklistGuild(guildId) {
    const removed = this.blacklistedGuilds.delete(guildId);
    if (removed) {
      Clientlogger.info(`Removed guild from blacklist: ${guildId}`);
    }
    return removed;
  }
  isGuildBlacklisted(guildId) {
    return this.blacklistedGuilds.has(guildId);
  }
  async checkPermissions(interaction, command) {
    if (this.isUserBlacklisted(interaction.user.id)) {
      return { allowed: false, reason: "User is blacklisted" };
    }
    if (interaction.guildId && this.isGuildBlacklisted(interaction.guildId)) {
      return { allowed: false, reason: "Guild is blacklisted" };
    }
    if (command.ownerOnly && !this.isOwner(interaction.user.id)) {
      return { allowed: false, reason: "This command is owner-only" };
    }
    if (command.guildOnly && !interaction.guildId) {
      return { allowed: false, reason: "This command can only be used in servers" };
    }
    if (command.nsfw && interaction.channel && !("nsfw" in interaction.channel && interaction.channel.nsfw)) {
      return { allowed: false, reason: "This command can only be used in NSFW channels" };
    }
    if (command.permissions && command.permissions.length > 0 && interaction.member instanceof GuildMember) {
      const hasPermissions = await this.checkDiscordPermissions(interaction.member, command.permissions);
      if (!hasPermissions.allowed) {
        return hasPermissions;
      }
    }
    return { allowed: true };
  }
  async checkDiscordPermissions(member, requiredPermissions) {
    try {
      const cacheKey = `${member.id}-${member.guild.id}`;
      const cached = this.permissionCache.get(cacheKey);
      let memberPermissions;
      if (cached && cached.expiresAt > Date.now()) {
        memberPermissions = cached.permissions;
      } else {
        await member.fetch();
        memberPermissions = member.permissions.toArray();
        this.permissionCache.set(cacheKey, {
          permissions: memberPermissions,
          expiresAt: Date.now() + 6e5
        });
      }
      const permissions = new PermissionsBitField(memberPermissions);
      const missing = [];
      for (const permission of requiredPermissions) {
        if (!permissions.has(permission)) {
          missing.push(permission.toString());
        }
      }
      if (missing.length > 0) {
        return {
          allowed: false,
          reason: `Missing permissions: ${missing.join(", ")}`
        };
      }
      return { allowed: true };
    } catch (error) {
      Clientlogger.error("Error checking Discord permissions:", error);
      return { allowed: false, reason: "Error checking permissions" };
    }
  }
  getUserPermissions(userId, guildId) {
    if (!guildId)
      return [];
    const cacheKey = `${userId}-${guildId}`;
    const cached = this.permissionCache.get(cacheKey);
    return cached && cached.expiresAt > Date.now() ? cached.permissions : [];
  }
  clearPermissionCache(userId, guildId) {
    if (userId && guildId) {
      this.permissionCache.delete(`${userId}-${guildId}`);
    } else {
      this.permissionCache.clear();
    }
    Clientlogger.debug("Permission cache cleared");
  }
  getStats() {
    return {
      owners: this.ownerIds.size,
      blacklistedUsers: this.blacklistedUsers.size,
      blacklistedGuilds: this.blacklistedGuilds.size,
      cachedPermissions: this.permissionCache.size
    };
  }
};

// src/managers/RateLimiter.ts
var RateLimiter = class {
  limits;
  defaultLimit;
  defaultWindow;
  // in seconds
  cleanupInterval;
  constructor(defaultLimit = 5, defaultWindow = 60) {
    this.limits = /* @__PURE__ */ new Map();
    this.defaultLimit = defaultLimit;
    this.defaultWindow = defaultWindow;
    this.startCleanup();
  }
  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.limits.entries()) {
        if (data.resetTime <= now) {
          this.limits.delete(key);
        }
      }
    }, 3e4);
  }
  getKey(identifier, action = "default") {
    return `${identifier}:${action}`;
  }
  checkLimit(identifier, action = "default", limit = this.defaultLimit, windowSeconds = this.defaultWindow) {
    const key = this.getKey(identifier, action);
    const now = Date.now();
    const windowMs = windowSeconds * 1e3;
    let data = this.limits.get(key);
    if (!data || data.resetTime <= now) {
      data = {
        count: 0,
        resetTime: now + windowMs,
        blocked: false
      };
    }
    if (data.blocked && data.resetTime > now) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: data.resetTime,
        blocked: true
      };
    }
    if (data.resetTime <= now) {
      data.blocked = false;
      data.count = 0;
      data.resetTime = now + windowMs;
    }
    const allowed = data.count < limit;
    if (allowed) {
      data.count++;
    } else {
      data.blocked = true;
      Clientlogger.warn(`Rate limit exceeded for ${identifier}:${action}`);
    }
    this.limits.set(key, data);
    return {
      allowed,
      remaining: Math.max(0, limit - data.count),
      resetTime: data.resetTime,
      blocked: data.blocked
    };
  }
  isBlocked(identifier, action = "default") {
    const key = this.getKey(identifier, action);
    const data = this.limits.get(key);
    if (!data)
      return false;
    const now = Date.now();
    if (data.resetTime <= now) {
      this.limits.delete(key);
      return false;
    }
    return data.blocked;
  }
  getRemainingTime(identifier, action = "default") {
    const key = this.getKey(identifier, action);
    const data = this.limits.get(key);
    if (!data)
      return 0;
    const now = Date.now();
    return Math.max(0, Math.ceil((data.resetTime - now) / 1e3));
  }
  clearLimit(identifier, action) {
    if (action) {
      const key = this.getKey(identifier, action);
      return this.limits.delete(key);
    } else {
      let cleared = 0;
      for (const key of this.limits.keys()) {
        if (key.startsWith(`${identifier}:`)) {
          this.limits.delete(key);
          cleared++;
        }
      }
      return cleared > 0;
    }
  }
  getStats() {
    const now = Date.now();
    let blocked = 0;
    let active = 0;
    for (const data of this.limits.values()) {
      if (data.resetTime > now) {
        active++;
        if (data.blocked) {
          blocked++;
        }
      }
    }
    return {
      totalLimits: this.limits.size,
      blockedLimits: blocked,
      activeLimits: active
    };
  }
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.limits.clear();
  }
};

// src/managers/HotReloadManager.ts
import fs4 from "fs";
import path6 from "path";
var HotReloadManager = class {
  watchers;
  enabled;
  reloadCallbacks;
  constructor(enabled = process.env.NODE_ENV === "development") {
    this.watchers = /* @__PURE__ */ new Map();
    this.enabled = enabled;
    this.reloadCallbacks = /* @__PURE__ */ new Map();
  }
  watchDirectory(directory, callback, options = {}) {
    if (!this.enabled)
      return;
    const { recursive = true, extensions = [".js", ".ts"] } = options;
    try {
      if (!fs4.existsSync(directory)) {
        Clientlogger.warn(`Hot reload: Directory ${directory} does not exist`);
        return;
      }
      const watcher = fs4.watch(directory, { recursive }, async (eventType, filename2) => {
        if (!filename2)
          return;
        const filePath = path6.join(directory, filename2);
        const ext = path6.extname(filename2);
        if (extensions.length > 0 && !extensions.includes(ext)) {
          return;
        }
        const callbackKey = `${directory}:${filename2}`;
        if (this.reloadCallbacks.has(callbackKey)) {
          return;
        }
        this.reloadCallbacks.set(callbackKey, callback);
        setTimeout(async () => {
          try {
            Clientlogger.info(`Hot reload: ${eventType} detected for ${filename2}`);
            await callback(filePath);
          } catch (error) {
            Clientlogger.error(`Hot reload error for ${filePath}:`, error);
          } finally {
            this.reloadCallbacks.delete(callbackKey);
          }
        }, 100);
      });
      this.watchers.set(directory, watcher);
      Clientlogger.info(`Hot reload: Watching ${directory} for changes`);
    } catch (error) {
      Clientlogger.error(`Failed to watch directory ${directory}:`, error);
    }
  }
  stopWatching(directory) {
    const watcher = this.watchers.get(directory);
    if (watcher) {
      watcher.close();
      this.watchers.delete(directory);
      Clientlogger.info(`Hot reload: Stopped watching ${directory}`);
      return true;
    }
    return false;
  }
  stopAllWatching() {
    for (const [directory, watcher] of this.watchers.entries()) {
      watcher.close();
      Clientlogger.info(`Hot reload: Stopped watching ${directory}`);
    }
    this.watchers.clear();
    this.reloadCallbacks.clear();
  }
  isEnabled() {
    return this.enabled;
  }
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAllWatching();
    }
    Clientlogger.info(`Hot reload: ${enabled ? "Enabled" : "Disabled"}`);
  }
  getWatchedDirectories() {
    return Array.from(this.watchers.keys());
  }
  getStats() {
    return {
      enabled: this.enabled,
      watchedDirectories: this.watchers.size,
      pendingCallbacks: this.reloadCallbacks.size
    };
  }
  destroy() {
    this.stopAllWatching();
  }
};

// src/index.ts
import gradient2 from "gradient-string";
import figlet from "figlet";
import path7 from "path";
var ClientHandler = class {
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
  _logger;
  static async create(options) {
    const handler = new ClientHandler(options);
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
      guild,
      ownerIds = [],
      enableHotReload = process.env.NODE_ENV === "development",
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
    this._commandsMap = /* @__PURE__ */ new Map();
    this._validationFuncs = [];
    this._logger = Logger.createChild("ClientHandler");
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
  async _initialize() {
    try {
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
        console.log(gradient2.rainbow(figletData));
      }
      this._logger.info("XtonCore Enhanced v2.0 is Starting...");
    } catch (error) {
      this._logger.warn("Could not display startup banner.");
    }
    await this._initializeManagers();
    if (this._commandsPath) {
      await this._commandsInit();
      this._client.once("ready", async () => {
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
    this._setupHotReload();
  }
  async _initializeManagers() {
    try {
      if (this._componentsPath) {
        await this._componentManager.initialize();
      }
      this._logger.info("Enhanced managers initialized successfully");
    } catch (error) {
      this._logger.error("Error initializing managers:", error);
    }
  }
  _setupHotReload() {
    if (!this._hotReloadManager.isEnabled())
      return;
    if (this._commandsPath) {
      this._hotReloadManager.watchDirectory(this._commandsPath, async (filePath) => {
        this._logger.info(`Reloading commands due to change in ${filePath}`);
        await this._commandsInit();
        this._registerSlashCommands();
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
    const commandArray = await buildCommandTree(this._commandsPath);
    this._commands = commandArray;
    this._commandsMap.clear();
    for (const cmd of commandArray) {
      if (cmd.name) {
        this._commandsMap.set(cmd.name, cmd);
      }
    }
  }
  _registerSlashCommands() {
    registerCommands({
      client: this._client,
      commands: this._commands,
      guild: this._guild
    }).catch((error) => Clientlogger.error("Error during slash command registration:", error));
  }
  async _eventsInit() {
    if (!this._eventsPath)
      return;
    const eventPaths = await getFolderPaths(this._eventsPath);
    for (const eventPath of eventPaths) {
      const eventName = path7.basename(eventPath);
      const eventFuncPaths = await getFilePaths(eventPath, true);
      eventFuncPaths.sort();
      if (!eventName)
        continue;
      this._client.on(eventName, async (...args) => {
        for (const eventFuncPath of eventFuncPaths) {
          try {
            const absolutePath = path7.resolve(eventFuncPath);
            const fileURL = pathToFileURL3(absolutePath).href;
            const eventModule = await import(fileURL);
            const eventFunc = eventModule.default || eventModule;
            if (typeof eventFunc === "function") {
              const cantRunEvent = await eventFunc(...args, this._client, this);
              if (cantRunEvent)
                break;
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
  async _validationsInit() {
    if (!this._validationsPath)
      return;
    const validationFilePaths = await getFilePaths(this._validationsPath, true);
    validationFilePaths.sort();
    for (const validationFilePath of validationFilePaths) {
      try {
        const absolutePath = path7.resolve(validationFilePath);
        const fileURL = pathToFileURL3(absolutePath).href;
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
      if (!interaction.isChatInputCommand())
        return;
      const command = this._commandsMap.get(interaction.commandName);
      if (!command)
        return;
      const startTime = Date.now();
      const userId = interaction.user.id;
      const guildId = interaction.guildId;
      try {
        if (this._options.rateLimiting?.enabled) {
          const rateLimit = this._rateLimiter.checkLimit(userId, "command");
          if (!rateLimit.allowed) {
            const remainingTime = this._rateLimiter.getRemainingTime(userId, "command");
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
          if (this._cooldownManager.isOnCooldown(userId, command.name)) {
            const remainingTime = this._cooldownManager.getRemainingTime(userId, command.name);
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
          if (!canRun)
            return;
        }
        await command.run({
          interaction,
          client: this._client,
          handler: this
        });
        if (command.cooldown && command.cooldown > 0) {
          this._cooldownManager.setCooldown(userId, command.name, command.cooldown);
        }
        const executionTime = Date.now() - startTime;
        this._performanceManager.recordCommandExecution(command.name, executionTime);
        this._logger.command(command.name, userId, guildId);
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
      if (!interaction.isAutocomplete())
        return;
      const command = this._commandsMap.get(interaction.commandName);
      if (!command || !command.autocomplete)
        return;
      try {
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
  // Utility methods
  async reloadCommands() {
    if (!this._commandsPath) {
      throw new Error("No commands path configured");
    }
    this._logger.info("Manually reloading commands...");
    await this._commandsInit();
    this._registerSlashCommands();
    this._logger.info("Commands reloaded successfully");
  }
  async reloadComponents() {
    if (!this._componentsPath) {
      throw new Error("No components path configured");
    }
    this._logger.info("Manually reloading components...");
    await this._componentManager.initialize();
    this._logger.info("Components reloaded successfully");
  }
  getStats() {
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
  generateReport() {
    const stats = this.getStats();
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
    this._cooldownManager.destroy();
    this._rateLimiter.destroy();
    this._hotReloadManager.destroy();
    this._logger.info("XtonCore Enhanced shutdown complete");
  }
};
export {
  ClientHandler
};
