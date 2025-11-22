/**
 * Lazy Command Loading System
 * Loads only command metadata at startup, defers loading run functions until needed
 */

import { getFilePaths } from './getPaths';
import path from 'path';

/**
 * Command metadata (lightweight)
 */
export interface CommandMetadata {
  name: string;
  description: string;
  filePath: string;
  deleted?: boolean;
  cooldown?: number;
  permissions?: any[];
  aliases?: string[];
  category?: string;
  ownerOnly?: boolean;
  guildOnly?: boolean;
  nsfw?: boolean;
  customData?: any;
  [key: string]: any;
}

/**
 * Lazy command with deferred loading
 */
export interface LazyCommand extends CommandMetadata {
  _loaded: boolean;
  _filePath: string;
  run?: (...args: any[]) => Promise<void>;
  autocomplete?: (...args: any[]) => Promise<void>;
}

/**
 * Build command tree with lazy loading
 * Only loads metadata, not the actual run functions
 */
export async function buildCommandTreeLazy(commandsDir?: string): Promise<LazyCommand[]> {
  const commandTree: LazyCommand[] = [];
  if (!commandsDir) return [];
  
  const startTime = Date.now();
  const commandFilePaths = await getFilePaths(commandsDir, true);

  for (const commandFilePath of commandFilePaths) {
    try {
      const absolutePath = path.resolve(commandFilePath);
      
      // ⚡ LAZY LOADING: Only load metadata, not the run function
      const metadata = await loadCommandMetadata(absolutePath);
      
      if (!metadata) continue;

      // Create lazy command object
      const lazyCommand: LazyCommand = {
        ...metadata,
        _loaded: false,
        _filePath: absolutePath,
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

/**
 * Load only command metadata (fast)
 */
async function loadCommandMetadata(filePath: string): Promise<CommandMetadata | null> {
  try {
    // Clear require cache to ensure fresh load
    delete require.cache[require.resolve(filePath)];
    
    const commandModule = require(filePath);
    const { data, deleted, cooldown, permissions, aliases, category, ownerOnly, guildOnly, nsfw, customData, ...rest } = 
      commandModule.default || commandModule;

    if (!data) {
      console.warn(`[LazyLoader] File ${filePath} missing "data" export`);
      return null;
    }

    // Convert SlashCommandBuilder to JSON if needed
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
      customData,
    };
  } catch (error) {
    console.error(`[LazyLoader] Error loading metadata from ${filePath}:`, error);
    return null;
  }
}

/**
 * Load the actual run function for a command (deferred)
 */
export async function loadCommandFunction(command: LazyCommand): Promise<void> {
  if (command._loaded) return; // Already loaded

  try {
    const startTime = Date.now();
    
    // Clear cache to ensure fresh load
    delete require.cache[require.resolve(command._filePath)];
    
    const commandModule = require(command._filePath);
    const { run, autocomplete } = commandModule.default || commandModule;

    if (!run) {
      throw new Error(`Command ${command.name} missing "run" function`);
    }

    // Attach run function to command
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

/**
 * Preload specific commands (useful for frequently used commands)
 */
export async function preloadCommands(commands: LazyCommand[], commandNames: string[]): Promise<void> {
  const startTime = Date.now();
  const preloadTasks: Promise<void>[] = [];

  for (const command of commands) {
    if (commandNames.includes(command.name)) {
      preloadTasks.push(loadCommandFunction(command));
    }
  }

  await Promise.all(preloadTasks);
  
  const loadTime = Date.now() - startTime;
  console.log(`[LazyLoader] Preloaded ${commandNames.length} commands in ${loadTime}ms`);
}

/**
 * Preload all commands (useful for production)
 */
export async function preloadAllCommands(commands: LazyCommand[]): Promise<void> {
  const startTime = Date.now();
  const preloadTasks = commands.map(cmd => loadCommandFunction(cmd));
  
  await Promise.all(preloadTasks);
  
  const loadTime = Date.now() - startTime;
  console.log(`[LazyLoader] Preloaded all ${commands.length} commands in ${loadTime}ms`);
}
