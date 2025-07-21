import fs from 'fs';
import path from 'path';
import { Clientlogger } from '../logger';

export class HotReloadManager {
  private watchers: Map<string, fs.FSWatcher>;
  private enabled: boolean;
  private reloadCallbacks: Map<string, (filePath: string) => Promise<void>>;

  constructor(enabled: boolean = process.env.NODE_ENV === 'development') {
    this.watchers = new Map();
    this.enabled = enabled;
    this.reloadCallbacks = new Map();
  }

  public watchDirectory(
    directory: string, 
    callback: (filePath: string) => Promise<void>,
    options: { recursive?: boolean; extensions?: string[] } = {}
  ): void {
    if (!this.enabled) return;

    const { recursive = true, extensions = ['.js', '.ts'] } = options;

    try {
      if (!fs.existsSync(directory)) {
        Clientlogger.warn(`Hot reload: Directory ${directory} does not exist`);
        return;
      }

      const watcher = fs.watch(directory, { recursive }, async (eventType, filename) => {
        if (!filename) return;

        const filePath = path.join(directory, filename);
        const ext = path.extname(filename);

        // Check if file extension is watched
        if (extensions.length > 0 && !extensions.includes(ext)) {
          return;
        }

        // Debounce rapid file changes
        const callbackKey = `${directory}:${filename}`;
        if (this.reloadCallbacks.has(callbackKey)) {
          return;
        }

        this.reloadCallbacks.set(callbackKey, callback);

        setTimeout(async () => {
          try {
            Clientlogger.info(`Hot reload: ${eventType} detected for ${filename}`);
            await callback(filePath);
          } catch (error) {
            Clientlogger.error(`Hot reload error for ${filePath}:`, error);
          } finally {
            this.reloadCallbacks.delete(callbackKey);
          }
        }, 100); // 100ms debounce
      });

      this.watchers.set(directory, watcher);
      Clientlogger.info(`Hot reload: Watching ${directory} for changes`);

    } catch (error) {
      Clientlogger.error(`Failed to watch directory ${directory}:`, error);
    }
  }

  public stopWatching(directory: string): boolean {
    const watcher = this.watchers.get(directory);
    if (watcher) {
      watcher.close();
      this.watchers.delete(directory);
      Clientlogger.info(`Hot reload: Stopped watching ${directory}`);
      return true;
    }
    return false;
  }

  public stopAllWatching(): void {
    for (const [directory, watcher] of this.watchers.entries()) {
      watcher.close();
      Clientlogger.info(`Hot reload: Stopped watching ${directory}`);
    }
    this.watchers.clear();
    this.reloadCallbacks.clear();
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAllWatching();
    }
    Clientlogger.info(`Hot reload: ${enabled ? 'Enabled' : 'Disabled'}`);
  }

  public getWatchedDirectories(): string[] {
    return Array.from(this.watchers.keys());
  }

  public getStats(): {
    enabled: boolean;
    watchedDirectories: number;
    pendingCallbacks: number;
  } {
    return {
      enabled: this.enabled,
      watchedDirectories: this.watchers.size,
      pendingCallbacks: this.reloadCallbacks.size
    };
  }

  public destroy(): void {
    this.stopAllWatching();
  }
}