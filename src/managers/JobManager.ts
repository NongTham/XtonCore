import { Client } from 'discord.js';
import { ClientHandler, Job } from '../dev';
import { Clientlogger } from '../logger';
import * as cron from 'node-cron';
import fs from 'fs';
import path from 'path';

interface ScheduledJob {
  jobDef: Job;
  task: cron.ScheduledTask;
}

export class JobManager {
  private jobs: Map<string, ScheduledJob> = new Map();
  private jobsPath: string;
  private client: Client;
  private handler: ClientHandler;

  constructor(jobsPath: string, client: Client, handler: ClientHandler) {
    this.jobsPath = jobsPath;
    this.client = client;
    this.handler = handler;
  }

  /**
   * Load all jobs from the specified directory
   */
  public async loadJobs(): Promise<number> {
    if (!fs.existsSync(this.jobsPath)) {
      Clientlogger.warn(`Jobs directory not found at ${this.jobsPath}`);
      return 0;
    }

    // Stop existing jobs if reloading
    this.stopAll();
    this.jobs.clear();

    const jobFiles = fs.readdirSync(this.jobsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    let loadedCount = 0;

    for (const file of jobFiles) {
      const filePath = path.join(this.jobsPath, file);
      try {
        // use dynamic import or require
        // Use require for CommonJS/TS compat in tests/dev mode, though import() is also possible
        delete require.cache[require.resolve(filePath)];
        const jobModule = require(filePath);
        
        const job: Job = jobModule.default || jobModule;

        if (!job.name || !job.cron || !job.run) {
          Clientlogger.error(`Invalid job format in ${file}. Expected name, cron, and run fields.`);
          continue;
        }

        // Validate cron expression
        if (!cron.validate(job.cron)) {
          Clientlogger.error(`Invalid cron expression "${job.cron}" for job ${job.name} in ${file}`);
          continue;
        }

        this.scheduleJob(job);
        loadedCount++;
      } catch (error) {
        Clientlogger.error(`Error loading job from ${file}:`, error);
      }
    }

    Clientlogger.info(`Loaded ${loadedCount} scheduled jobs`);
    return loadedCount;
  }

  /**
   * Schedule a singular job
   */
  public scheduleJob(job: Job): void {
    if (job.enabled === false) {
      Clientlogger.debug(`Job ${job.name} is disabled. Skipping...`);
      return;
    }

    const task = cron.schedule(job.cron, async () => {
      Clientlogger.debug(`Executing job: ${job.name}`);
      try {
        await job.run(this.client, this.handler);
      } catch (error) {
        Clientlogger.error(`Error executing job ${job.name}:`, error);
      }
    });

    this.jobs.set(job.name, { jobDef: job, task });
  }

  /**
   * Stop a specific job
   */
  public stopJob(name: string): boolean {
    const job = this.jobs.get(name);
    if (job) {
      job.task.stop();
      return true;
    }
    return false;
  }

  /**
   * Start a manually stopped job
   */
  public startJob(name: string): boolean {
    const job = this.jobs.get(name);
    if (job) {
      job.task.start();
      return true;
    }
    return false;
  }

  /**
   * Get statistics about loaded jobs
   */
  public getStats(): { total: number; activeNames: string[] } {
    return {
      total: this.jobs.size,
      activeNames: Array.from(this.jobs.keys())
    };
  }

  /**
   * Stop all jobs
   */
  public stopAll(): void {
    for (const [_, job] of this.jobs) {
      job.task.stop();
    }
  }

  /**
   * Clean up everything
   */
  public destroy(): void {
    this.stopAll();
    this.jobs.clear();
  }
}
