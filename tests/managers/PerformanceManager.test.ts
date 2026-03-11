import { PerformanceManager } from '../../src/managers/PerformanceManager';

// Mock the logger to avoid side effects
jest.mock('../../src/logger', () => ({
    Clientlogger: {
        info: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

// Mock fs to prevent actual file operations
jest.mock('fs/promises', () => ({
    mkdir: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockRejectedValue(new Error('ENOENT')),
    writeFile: jest.fn().mockResolvedValue(undefined),
}));

describe('PerformanceManager', () => {
    let manager: PerformanceManager;

    beforeEach(() => {
        jest.useFakeTimers();
        manager = new PerformanceManager();
    });

    afterEach(() => {
        manager.destroy();
        jest.useRealTimers();
    });

    describe('recordCommandExecution', () => {
        it('should record a command execution', () => {
            manager.recordCommandExecution('ping', 50);

            const stats = manager.getCommandStats('ping');
            expect(stats).not.toBeNull();
            expect((stats as any).name).toBe('ping');
            expect((stats as any).uses).toBe(1);
            expect((stats as any).averageExecutionTime).toBe(50);
        });

        it('should accumulate multiple executions', () => {
            manager.recordCommandExecution('ping', 50);
            manager.recordCommandExecution('ping', 100);

            const stats = manager.getCommandStats('ping');
            expect((stats as any).uses).toBe(2);
            expect((stats as any).averageExecutionTime).toBe(75);
        });

        it('should track different commands separately', () => {
            manager.recordCommandExecution('ping', 50);
            manager.recordCommandExecution('help', 100);

            const pingStats = manager.getCommandStats('ping');
            const helpStats = manager.getCommandStats('help');

            expect((pingStats as any).uses).toBe(1);
            expect((helpStats as any).uses).toBe(1);
        });
    });

    describe('recordCommandError', () => {
        it('should record errors for existing commands', () => {
            manager.recordCommandExecution('ping', 50);
            manager.recordCommandError('ping');

            const stats = manager.getCommandStats('ping');
            expect((stats as any).errors).toBe(1);
        });

        it('should not crash when recording error for unknown command', () => {
            expect(() => manager.recordCommandError('unknown')).not.toThrow();
        });
    });

    describe('getCommandStats', () => {
        it('should return null for unknown command', () => {
            expect(manager.getCommandStats('unknown')).toBeNull();
        });

        it('should return all stats when no command name specified', () => {
            manager.recordCommandExecution('ping', 50);
            manager.recordCommandExecution('help', 100);

            const allStats = manager.getCommandStats();
            expect(Array.isArray(allStats)).toBe(true);
            expect((allStats as any[]).length).toBe(2);
        });
    });

    describe('getTopCommands', () => {
        it('should return commands sorted by usage', () => {
            manager.recordCommandExecution('ping', 50);
            manager.recordCommandExecution('help', 100);
            manager.recordCommandExecution('help', 100);
            manager.recordCommandExecution('stats', 200);
            manager.recordCommandExecution('stats', 200);
            manager.recordCommandExecution('stats', 200);

            const top = manager.getTopCommands(2);
            expect(top).toHaveLength(2);
            expect(top[0].name).toBe('stats');
            expect(top[1].name).toBe('help');
        });

        it('should return empty array when no commands recorded', () => {
            expect(manager.getTopCommands()).toHaveLength(0);
        });
    });

    describe('getMemoryUsage', () => {
        it('should return current memory usage', () => {
            const memory = manager.getMemoryUsage();
            expect(memory.current).toBeGreaterThan(0);
            expect(typeof memory.average).toBe('number');
            expect(typeof memory.peak).toBe('number');
        });
    });

    describe('getPerformanceMetrics', () => {
        it('should return metrics object', () => {
            const metrics = manager.getPerformanceMetrics();
            expect(metrics).toHaveProperty('commandExecutions');
            expect(metrics).toHaveProperty('commandErrors');
            expect(metrics).toHaveProperty('commandTimes');
            expect(metrics).toHaveProperty('memoryUsage');
            expect(metrics).toHaveProperty('uptime');
        });
    });

    describe('generateReport', () => {
        it('should generate a report string', () => {
            manager.recordCommandExecution('ping', 50);
            const report = manager.generateReport();

            expect(typeof report).toBe('string');
            expect(report).toContain('Performance Report');
            expect(report).toContain('ping');
        });

        it('should generate a report even with no commands', () => {
            const report = manager.generateReport();
            expect(typeof report).toBe('string');
            expect(report).toContain('Performance Report');
        });
    });

    describe('destroy', () => {
        it('should clear command stats', () => {
            manager.recordCommandExecution('ping', 50);
            manager.destroy();

            const stats = manager.getCommandStats();
            expect(Array.isArray(stats)).toBe(true);
            expect((stats as any[]).length).toBe(0);
        });
    });
});
