import { CooldownManager } from '../../src/managers/CooldownManager';

// Mock the logger to avoid side effects
jest.mock('../../src/logger', () => ({
    Clientlogger: {
        info: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

describe('CooldownManager', () => {
    let manager: CooldownManager;

    beforeEach(() => {
        manager = new CooldownManager();
        jest.useFakeTimers();
    });

    afterEach(async () => {
        await manager.destroy();
        jest.useRealTimers();
    });

    describe('setCooldown / getCooldown', () => {
        it('should set and retrieve a cooldown', async () => {
            await manager.setCooldown('user1', 'ping', 30);
            const cooldown = await manager.getCooldown('user1', 'ping');

            expect(cooldown).not.toBeNull();
            expect(cooldown!.userId).toBe('user1');
            expect(cooldown!.commandName).toBe('ping');
        });

        it('should return null for non-existent cooldown', async () => {
            expect(await manager.getCooldown('user1', 'unknown')).toBeNull();
        });
    });

    describe('isOnCooldown', () => {
        it('should return true when user is on cooldown', async () => {
            await manager.setCooldown('user1', 'ping', 30);
            expect(await manager.isOnCooldown('user1', 'ping')).toBe(true);
        });

        it('should return false when no cooldown exists', async () => {
            expect(await manager.isOnCooldown('user1', 'ping')).toBe(false);
        });

        it('should return false after cooldown expires', async () => {
            await manager.setCooldown('user1', 'ping', 5);
            jest.advanceTimersByTime(6000); // Advance past 5 seconds
            expect(await manager.isOnCooldown('user1', 'ping')).toBe(false);
        });
    });

    describe('getRemainingTime', () => {
        it('should return remaining time in seconds', async () => {
            await manager.setCooldown('user1', 'ping', 30);
            jest.advanceTimersByTime(10000); // Advance 10 seconds
            const remaining = await manager.getRemainingTime('user1', 'ping');
            expect(remaining).toBe(20);
        });

        it('should return 0 when no cooldown', async () => {
            expect(await manager.getRemainingTime('user1', 'ping')).toBe(0);
        });

        it('should return 0 after cooldown expires', async () => {
            await manager.setCooldown('user1', 'ping', 5);
            jest.advanceTimersByTime(6000);
            expect(await manager.getRemainingTime('user1', 'ping')).toBe(0);
        });
    });

    describe('removeCooldown', () => {
        it('should remove an existing cooldown', async () => {
            await manager.setCooldown('user1', 'ping', 30);
            expect(await manager.removeCooldown('user1', 'ping')).toBe(true);
            expect(await manager.isOnCooldown('user1', 'ping')).toBe(false);
        });

        it('should return false when removing non-existent cooldown', async () => {
            expect(await manager.removeCooldown('user1', 'unknown')).toBe(false);
        });
    });

    describe('clearUserCooldowns', () => {
        it('should clear all cooldowns for a specific user', async () => {
            await manager.setCooldown('user1', 'ping', 30);
            await manager.setCooldown('user1', 'help', 30);
            await manager.setCooldown('user2', 'ping', 30);

            const cleared = await manager.clearUserCooldowns('user1');
            expect(cleared).toBe(2);
            expect(await manager.isOnCooldown('user1', 'ping')).toBe(false);
            expect(await manager.isOnCooldown('user1', 'help')).toBe(false);
            expect(await manager.isOnCooldown('user2', 'ping')).toBe(true);
        });
    });

    describe('getAllCooldowns / getCooldownCount', () => {
        it('should return all active cooldowns', async () => {
            await manager.setCooldown('user1', 'ping', 30);
            await manager.setCooldown('user2', 'help', 30);

            expect(await manager.getAllCooldowns()).toHaveLength(2);
            expect(await manager.getCooldownCount()).toBe(2);
        });
    });

    describe('destroy', () => {
        it('should clear all cooldowns', async () => {
            await manager.setCooldown('user1', 'ping', 30);
            await manager.destroy();
            expect(await manager.getCooldownCount()).toBe(0);
        });
    });
});
