import { PerformanceMetrics, CommandStats } from '../dev';
import { Clientlogger } from '../logger';
import fs from 'fs/promises';
import path from 'path';

export class PerformanceManager {
  private metrics: PerformanceMetrics;
  private commandStats: Map<string, CommandStats>;
  private startTime: number;
  private statsFile: string;

  constructor() {
    this.startTime = Date.now();
    this.statsFile = path.join(process.cwd(), 'stats', 'command-stats.json');
    this.metrics = {
      commandExecutions: new Map(),
      commandErrors: new Map(),
      commandTimes: new Map(),
      memoryUsage: [],
      uptime: 0
    };
    this.commandStats = new Map();
    this.initializeStatsDirectory();
    this.loadStats();
    this.startMemoryMonitoring();
  }

  private async initializeStatsDirectory(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.statsFile), { recursive: true });
    } catch (error) {
      Clientlogger.error('Failed to create stats directory:', error);
    }
  }

  private async loadStats(): Promise<void> {
    try {
      const data = await fs.readFile(this.statsFile, 'utf-8');
      const savedStats = JSON.parse(data);
      
      for (const [name, stats] of Object.entries(savedStats)) {
        this.commandStats.set(name, {
          ...(stats as CommandStats),
          lastUsed: new Date((stats as any).lastUsed)
        });
      }
      
      Clientlogger.info(`Loaded stats for ${this.commandStats.size} commands`);
    } catch (error) {
      Clientlogger.info('No existing stats file found, starting fresh');
    }
  }

  private async saveStats(): Promise<void> {
    try {
      const statsObject = Object.fromEntries(this.commandStats);
      await fs.writeFile(this.statsFile, JSON.stringify(statsObject, null, 2));
    } catch (error) {
      Clientlogger.error('Failed to save stats:', error);
    }
  }

  private startMemoryMonitoring(): void {
    setInterval(() => {
      const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;
      this.metrics.memoryUsage.push(memUsage);
      
      // Keep only last 100 readings
      if (this.metrics.memoryUsage.length > 100) {
        this.metrics.memoryUsage.shift();
      }
      
      this.metrics.uptime = Date.now() - this.startTime;
    }, 30000); // Every 30 seconds

    // Save stats every 5 minutes
    setInterval(() => {
      this.saveStats();
    }, 300000);
  }

  public recordCommandExecution(commandName: string, executionTime: number): void {
    // Update metrics
    this.metrics.commandExecutions.set(
      commandName, 
      (this.metrics.commandExecutions.get(commandName) || 0) + 1
    );

    const times = this.metrics.commandTimes.get(commandName) || [];
    times.push(executionTime);
    if (times.length > 50) times.shift(); // Keep last 50 executions
    this.metrics.commandTimes.set(commandName, times);

    // Update command stats
    const stats = this.commandStats.get(commandName) || {
      name: commandName,
      uses: 0,
      errors: 0,
      lastUsed: new Date(),
      averageExecutionTime: 0
    };

    stats.uses++;
    stats.lastUsed = new Date();
    stats.averageExecutionTime = times.reduce((a, b) => a + b, 0) / times.length;
    
    this.commandStats.set(commandName, stats);
  }

  public recordCommandError(commandName: string): void {
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

  public getCommandStats(commandName?: string): CommandStats[] | CommandStats | null {
    if (commandName) {
      return this.commandStats.get(commandName) || null;
    }
    return Array.from(this.commandStats.values());
  }

  public getTopCommands(limit: number = 10): CommandStats[] {
    return Array.from(this.commandStats.values())
      .sort((a, b) => b.uses - a.uses)
      .slice(0, limit);
  }

  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getMemoryUsage(): { current: number; average: number; peak: number } {
    const current = process.memoryUsage().heapUsed / 1024 / 1024;
    const average = this.metrics.memoryUsage.reduce((a, b) => a + b, 0) / this.metrics.memoryUsage.length || 0;
    const peak = Math.max(...this.metrics.memoryUsage, current);

    return { current, average, peak };
  }

  public generateReport(): string {
    const topCommands = this.getTopCommands(5);
    const memory = this.getMemoryUsage();
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);

    let report = `📊 **Performance Report**\n`;
    report += `⏱️ Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m\n`;
    report += `💾 Memory: ${memory.current.toFixed(2)}MB (avg: ${memory.average.toFixed(2)}MB, peak: ${memory.peak.toFixed(2)}MB)\n\n`;
    
    report += `🏆 **Top Commands:**\n`;
    topCommands.forEach((cmd, i) => {
      report += `${i + 1}. ${cmd.name}: ${cmd.uses} uses (${cmd.averageExecutionTime.toFixed(2)}ms avg)\n`;
    });

    return report;
  }
}