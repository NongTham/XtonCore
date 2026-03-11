import { RateLimiter } from '../../src/managers/RateLimiter';

// Mock the logger to avoid side effects
jest.mock('../../src/logger', () => ({
    Clientlogger: {
        info: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

describe('RateLimiter', () => {
    let limiter: RateLimiter;

    beforeEach(() => {
        limiter = new RateLimiter(3, 60); // 3 requests per 60 seconds
        jest.useFakeTimers();
    });

    afterEach(async () => {
        await limiter.destroy();
        jest.useRealTimers();
    });

    describe('checkLimit', () => {
        it('should allow requests within the limit', async () => {
            const result = await limiter.checkLimit('user1');
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(2);
            expect(result.blocked).toBe(false);
        });

        it('should block after exceeding the limit', async () => {
            await limiter.checkLimit('user1'); // 1
            await limiter.checkLimit('user1'); // 2
            await limiter.checkLimit('user1'); // 3

            const result = await limiter.checkLimit('user1'); // 4 — should block
            expect(result.allowed).toBe(false);
            expect(result.remaining).toBe(0);
            expect(result.blocked).toBe(true);
        });

        it('should use custom limit and window', async () => {
            const result1 = await limiter.checkLimit('user1', 'action', 1, 10);
            expect(result1.allowed).toBe(true);

            const result2 = await limiter.checkLimit('user1', 'action', 1, 10);
            expect(result2.allowed).toBe(false);
        });

        it('should reset after window expires', async () => {
            await limiter.checkLimit('user1');
            await limiter.checkLimit('user1');
            await limiter.checkLimit('user1');

            const blocked = await limiter.checkLimit('user1');
            expect(blocked.allowed).toBe(false);

            // Advance past the 60-second window
            jest.advanceTimersByTime(61000);

            const reset = await limiter.checkLimit('user1');
            expect(reset.allowed).toBe(true);
            expect(reset.remaining).toBe(2);
        });

        it('should track different actions separately', async () => {
            await limiter.checkLimit('user1', 'action1');
            await limiter.checkLimit('user1', 'action1');
            await limiter.checkLimit('user1', 'action1');

            // action1 is at limit, but action2 should still work
            const result = await limiter.checkLimit('user1', 'action2');
            expect(result.allowed).toBe(true);
        });
    });

    describe('isBlocked', () => {
        it('should return false when not blocked', async () => {
            expect(await limiter.isBlocked('user1')).toBe(false);
        });

        it('should return true when blocked', async () => {
            await limiter.checkLimit('user1');
            await limiter.checkLimit('user1');
            await limiter.checkLimit('user1');
            await limiter.checkLimit('user1'); // triggers block

            expect(await limiter.isBlocked('user1')).toBe(true);
        });

        it('should return false after window expires', async () => {
            await limiter.checkLimit('user1');
            await limiter.checkLimit('user1');
            await limiter.checkLimit('user1');
            await limiter.checkLimit('user1');

            jest.advanceTimersByTime(61000);
            expect(await limiter.isBlocked('user1')).toBe(false);
        });
    });

    describe('getRemainingTime', () => {
        it('should return 0 for unknown identifier', async () => {
            expect(await limiter.getRemainingTime('unknown')).toBe(0);
        });

        it('should return remaining time in seconds', async () => {
            await limiter.checkLimit('user1');
            jest.advanceTimersByTime(10000);
            const remaining = await limiter.getRemainingTime('user1');
            expect(remaining).toBe(50);
        });
    });

    describe('clearLimit', () => {
        it('should clear a specific action limit', async () => {
            await limiter.checkLimit('user1', 'action1');
            expect(await limiter.clearLimit('user1', 'action1')).toBe(true);
        });

        it('should clear all limits for an identifier', async () => {
            await limiter.checkLimit('user1', 'action1');
            await limiter.checkLimit('user1', 'action2');
            expect(await limiter.clearLimit('user1')).toBe(true);
        });

        it('should return false when nothing to clear', async () => {
            expect(await limiter.clearLimit('unknown', 'action')).toBe(false);
        });
    });

    describe('getStats', () => {
        it('should return correct stats', async () => {
            await limiter.checkLimit('user1');
            await limiter.checkLimit('user2');

            const stats = await limiter.getStats();
            expect(stats.totalLimits).toBe(2);
            expect(stats.activeLimits).toBe(2);
            expect(stats.blockedLimits).toBe(0);
        });

        it('should count blocked limits', async () => {
            await limiter.checkLimit('user1');
            await limiter.checkLimit('user1');
            await limiter.checkLimit('user1');
            await limiter.checkLimit('user1'); // blocked

            const stats = await limiter.getStats();
            expect(stats.blockedLimits).toBe(1);
        });
    });

    describe('destroy', () => {
        it('should clear all limits', async () => {
            await limiter.checkLimit('user1');
            await limiter.destroy();

            const stats = await limiter.getStats();
            expect(stats.totalLimits).toBe(0);
        });
    });
});
