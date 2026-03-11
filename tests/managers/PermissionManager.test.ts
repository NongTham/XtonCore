import { PermissionManager } from '../../src/managers/PermissionManager';

// Mock the logger to avoid side effects
jest.mock('../../src/logger', () => ({
    Clientlogger: {
        info: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

describe('PermissionManager', () => {
    let manager: PermissionManager;

    beforeEach(() => {
        manager = new PermissionManager(['owner1', 'owner2']);
    });

    afterEach(() => {
        manager.destroy();
    });

    describe('Owner Management', () => {
        it('should initialize with provided owner IDs', () => {
            expect(manager.isOwner('owner1')).toBe(true);
            expect(manager.isOwner('owner2')).toBe(true);
        });

        it('should add a new owner', () => {
            manager.addOwner('owner3');
            expect(manager.isOwner('owner3')).toBe(true);
        });

        it('should remove an owner', () => {
            expect(manager.removeOwner('owner1')).toBe(true);
            expect(manager.isOwner('owner1')).toBe(false);
        });

        it('should return false when removing non-existent owner', () => {
            expect(manager.removeOwner('unknown')).toBe(false);
        });

        it('should not identify non-owners', () => {
            expect(manager.isOwner('random_user')).toBe(false);
        });
    });

    describe('User Blacklist', () => {
        it('should blacklist a user', () => {
            manager.blacklistUser('bad_user');
            expect(manager.isUserBlacklisted('bad_user')).toBe(true);
        });

        it('should unblacklist a user', () => {
            manager.blacklistUser('bad_user');
            expect(manager.unblacklistUser('bad_user')).toBe(true);
            expect(manager.isUserBlacklisted('bad_user')).toBe(false);
        });

        it('should return false when unblacklisting non-blacklisted user', () => {
            expect(manager.unblacklistUser('good_user')).toBe(false);
        });

        it('should not blacklist by default', () => {
            expect(manager.isUserBlacklisted('any_user')).toBe(false);
        });
    });

    describe('Guild Blacklist', () => {
        it('should blacklist a guild', () => {
            manager.blacklistGuild('bad_guild');
            expect(manager.isGuildBlacklisted('bad_guild')).toBe(true);
        });

        it('should unblacklist a guild', () => {
            manager.blacklistGuild('bad_guild');
            expect(manager.unblacklistGuild('bad_guild')).toBe(true);
            expect(manager.isGuildBlacklisted('bad_guild')).toBe(false);
        });

        it('should return false when unblacklisting non-blacklisted guild', () => {
            expect(manager.unblacklistGuild('good_guild')).toBe(false);
        });
    });

    describe('getStats', () => {
        it('should return correct stats', () => {
            manager.blacklistUser('user1');
            manager.blacklistGuild('guild1');

            const stats = manager.getStats();
            expect(stats.owners).toBe(2);
            expect(stats.blacklistedUsers).toBe(1);
            expect(stats.blacklistedGuilds).toBe(1);
            expect(stats.cachedPermissions).toBe(0);
        });
    });

    describe('getUserPermissions', () => {
        it('should return empty array without guild ID', () => {
            expect(manager.getUserPermissions('user1')).toEqual([]);
        });

        it('should return empty array for uncached user', () => {
            expect(manager.getUserPermissions('user1', 'guild1')).toEqual([]);
        });
    });

    describe('clearPermissionCache', () => {
        it('should not throw when clearing empty cache', () => {
            expect(() => manager.clearPermissionCache()).not.toThrow();
        });

        it('should not throw when clearing specific user cache', () => {
            expect(() => manager.clearPermissionCache('user1', 'guild1')).not.toThrow();
        });
    });

    describe('destroy', () => {
        it('should clear permission cache', () => {
            manager.destroy();
            const stats = manager.getStats();
            expect(stats.cachedPermissions).toBe(0);
        });
    });

    describe('Default constructor', () => {
        it('should work with no owner IDs', () => {
            const emptyManager = new PermissionManager();
            expect(emptyManager.getStats().owners).toBe(0);
            emptyManager.destroy();
        });
    });
});
