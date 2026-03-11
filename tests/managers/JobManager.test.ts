import { JobManager } from '../../src/managers/JobManager';
import { Client } from 'discord.js';
import { ClientHandler, Job } from '../../src/dev';
import * as cron from 'node-cron';
import fs from 'fs';
import path from 'path';

// Mock logger
jest.mock('../../src/logger', () => ({
  Clientlogger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock cron
jest.mock('node-cron', () => {
  return {
    validate: jest.fn().mockReturnValue(true),
    schedule: jest.fn().mockImplementation((expr, callback) => ({
      start: jest.fn(),
      stop: jest.fn(),
      expr,
      callback
    })),
  };
});

describe('JobManager', () => {
  let manager: JobManager;
  let mockClient: Client;
  let mockHandler: ClientHandler;
  const tempJobsDir = path.join(__dirname, 'temp_jobs');

  beforeEach(() => {
    mockClient = {} as Client;
    mockHandler = {} as ClientHandler;
    
    // Create temporary jobs directory for require() testing
    if (!fs.existsSync(tempJobsDir)) {
      fs.mkdirSync(tempJobsDir);
    }

    manager = new JobManager(tempJobsDir, mockClient, mockHandler);
    jest.clearAllMocks();
  });

  afterEach(() => {
    manager.destroy();
    if (fs.existsSync(tempJobsDir)) {
      fs.rmSync(tempJobsDir, { recursive: true, force: true });
    }
  });

  describe('Initialization and Stats', () => {
    it('should initialize empty', () => {
      const stats = manager.getStats();
      expect(stats.total).toBe(0);
      expect(stats.activeNames).toEqual([]);
    });
  });

  describe('Job Scheduling', () => {
    it('should schedule a valid job', () => {
      const mockRun = jest.fn();
      const job: Job = {
        name: 'testJob',
        cron: '* * * * *',
        run: mockRun
      };

      manager.scheduleJob(job);
      
      expect(cron.schedule).toHaveBeenCalledWith(job.cron, expect.any(Function));
      
      const stats = manager.getStats();
      expect(stats.total).toBe(1);
      expect(stats.activeNames).toContain('testJob');
    });

    it('should not schedule disabled jobs', () => {
      const job: Job = {
        name: 'disabledJob',
        cron: '* * * * *',
        enabled: false,
        run: jest.fn()
      };

      manager.scheduleJob(job);
      
      expect(cron.schedule).not.toHaveBeenCalled();
      const stats = manager.getStats();
      expect(stats.total).toBe(0);
    });
  });

  describe('Job Control (Start/Stop)', () => {
    let mockTask: any;

    beforeEach(() => {
      mockTask = { start: jest.fn(), stop: jest.fn() };
      (cron.schedule as jest.Mock).mockReturnValue(mockTask);
    });

    it('should stop and start jobs', () => {
      manager.scheduleJob({ name: 'testJob', cron: '* * * * *', run: jest.fn() });

      expect(manager.stopJob('testJob')).toBe(true);
      expect(mockTask.stop).toHaveBeenCalled();

      expect(manager.startJob('testJob')).toBe(true);
      expect(mockTask.start).toHaveBeenCalled();
    });

    it('should return false when controlling unknown jobs', () => {
      expect(manager.stopJob('unknown')).toBe(false);
      expect(manager.startJob('unknown')).toBe(false);
    });

    it('should stop all jobs', () => {
      manager.scheduleJob({ name: 'job1', cron: '* * * * *', run: jest.fn() });
      manager.scheduleJob({ name: 'job2', cron: '* * * * *', run: jest.fn() });

      manager.stopAll();
      // Should be called twice, one for each job
      expect(mockTask.stop).toHaveBeenCalledTimes(2);
    });
  });

  describe('File Loading (loadJobs)', () => {
    it('should return 0 when directory does not exist', async () => {
      const emptyManager = new JobManager('./nonexistent_dir', mockClient, mockHandler);
      const loaded = await emptyManager.loadJobs();
      expect(loaded).toBe(0);
    });

    it('should load jobs from directory', async () => {
      // Write a dummy job file
      const jobFileContent = `
        module.exports = {
          name: 'fileJob',
          cron: '* * * * *',
          run: () => {}
        };
      `;
      fs.writeFileSync(path.join(tempJobsDir, 'dummyJob.js'), jobFileContent);

      const loaded = await manager.loadJobs();
      expect(loaded).toBe(1);
      
      const stats = manager.getStats();
      expect(stats.activeNames).toContain('fileJob');
    });

    it('should ignore invalid job files', async () => {
      // Write an invalid job file (missing cron and run)
      const invalidContent = `module.exports = { name: 'invalid' };`;
      fs.writeFileSync(path.join(tempJobsDir, 'invalid.js'), invalidContent);

      const loaded = await manager.loadJobs();
      expect(loaded).toBe(0);
    });

    it('should skip jobs with invalid cron expressions', async () => {
      (cron.validate as jest.Mock).mockReturnValueOnce(false);
      
      const jobFileContent = `
        module.exports = {
          name: 'badCron',
          cron: 'invalid string',
          run: () => {}
        };
      `;
      fs.writeFileSync(path.join(tempJobsDir, 'badCron.js'), jobFileContent);

      const loaded = await manager.loadJobs();
      expect(loaded).toBe(0);
    });
  });
});
