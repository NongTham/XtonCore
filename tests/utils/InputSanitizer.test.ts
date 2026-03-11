import { InputSanitizer } from '../../src/utils/InputSanitizer';

describe('InputSanitizer', () => {
    describe('sanitizeString', () => {
        it('should return empty string for null/undefined input', () => {
            expect(InputSanitizer.sanitizeString(null as any)).toBe('');
            expect(InputSanitizer.sanitizeString(undefined as any)).toBe('');
            expect(InputSanitizer.sanitizeString('')).toBe('');
        });

        it('should trim whitespace', () => {
            expect(InputSanitizer.sanitizeString('  hello  ')).toBe('hello');
        });

        it('should truncate to maxLength', () => {
            const input = 'a'.repeat(100);
            const result = InputSanitizer.sanitizeString(input, { maxLength: 10 });
            expect(result.length).toBe(10);
        });

        it('should remove script tags by default', () => {
            const input = 'hello <script>alert("xss")</script> world';
            const result = InputSanitizer.sanitizeString(input);
            expect(result).not.toContain('<script>');
            expect(result).toContain('hello');
            expect(result).toContain('world');
        });

        it('should remove javascript: protocol', () => {
            const input = 'javascript:alert(1)';
            const result = InputSanitizer.sanitizeString(input);
            expect(result).not.toContain('javascript:');
        });

        it('should remove iframe tags', () => {
            const input = 'test <iframe src="evil.com"></iframe>';
            const result = InputSanitizer.sanitizeString(input);
            expect(result).not.toContain('<iframe');
        });

        it('should allow HTML when option is set', () => {
            const input = '<b>bold</b>';
            const result = InputSanitizer.sanitizeString(input, { allowHtml: true, allowSql: true });
            expect(result).toContain('<b>');
        });

        it('should remove null bytes and control characters', () => {
            const input = 'hello\x00world\x01test';
            const result = InputSanitizer.sanitizeString(input);
            expect(result).toBe('helloworldtest');
        });

        it('should apply custom patterns', () => {
            const input = 'hello badword world';
            const result = InputSanitizer.sanitizeString(input, {
                customPatterns: [/badword/gi],
            });
            expect(result).not.toContain('badword');
        });
    });

    describe('sanitizeDiscordContent', () => {
        it('should remove @everyone mentions', () => {
            const result = InputSanitizer.sanitizeDiscordContent('hey @everyone check this');
            expect(result).not.toContain('@everyone');
        });

        it('should remove @here mentions', () => {
            const result = InputSanitizer.sanitizeDiscordContent('hey @here look');
            expect(result).not.toContain('@here');
        });

        it('should remove Discord invite links', () => {
            const result = InputSanitizer.sanitizeDiscordContent('join discord.gg/abc123');
            expect(result).not.toContain('discord.gg/');
        });

        it('should remove executable download links', () => {
            const result = InputSanitizer.sanitizeDiscordContent('download https://evil.com/malware.exe');
            expect(result).not.toContain('.exe');
        });
    });

    describe('validateUserId', () => {
        it('should validate correct Discord user IDs', () => {
            expect(InputSanitizer.validateUserId('123456789012345678')).toBe(true);  // 18 digits
            expect(InputSanitizer.validateUserId('1234567890123456789')).toBe(true); // 19 digits
        });

        it('should reject invalid user IDs', () => {
            expect(InputSanitizer.validateUserId('123')).toBe(false);             // Too short
            expect(InputSanitizer.validateUserId('abc123456789012345')).toBe(false); // Contains letters
            expect(InputSanitizer.validateUserId('')).toBe(false);                  // Empty
        });
    });

    describe('validateGuildId', () => {
        it('should validate correct guild IDs', () => {
            expect(InputSanitizer.validateGuildId('123456789012345678')).toBe(true);
        });

        it('should reject invalid guild IDs', () => {
            expect(InputSanitizer.validateGuildId('short')).toBe(false);
        });
    });

    describe('validateChannelId', () => {
        it('should validate correct channel IDs', () => {
            expect(InputSanitizer.validateChannelId('123456789012345678')).toBe(true);
        });

        it('should reject invalid channel IDs', () => {
            expect(InputSanitizer.validateChannelId('bad_id')).toBe(false);
        });
    });

    describe('escapeRegex', () => {
        it('should escape special regex characters', () => {
            expect(InputSanitizer.escapeRegex('hello.world')).toBe('hello\\.world');
            expect(InputSanitizer.escapeRegex('test*')).toBe('test\\*');
            expect(InputSanitizer.escapeRegex('(foo)')).toBe('\\(foo\\)');
            expect(InputSanitizer.escapeRegex('[bar]')).toBe('\\[bar\\]');
        });

        it('should leave normal strings unchanged', () => {
            expect(InputSanitizer.escapeRegex('hello world')).toBe('hello world');
        });
    });

    describe('isValidUrl', () => {
        it('should validate correct URLs', () => {
            expect(InputSanitizer.isValidUrl('https://example.com')).toBe(true);
            expect(InputSanitizer.isValidUrl('http://localhost:3000')).toBe(true);
            expect(InputSanitizer.isValidUrl('ftp://files.example.com')).toBe(true);
        });

        it('should reject invalid URLs', () => {
            expect(InputSanitizer.isValidUrl('not a url')).toBe(false);
            expect(InputSanitizer.isValidUrl('')).toBe(false);
            expect(InputSanitizer.isValidUrl('example.com')).toBe(false);
        });
    });

    describe('sanitizeFileName', () => {
        it('should remove dangerous characters from filenames', () => {
            expect(InputSanitizer.sanitizeFileName('hello<>:"/\\|?*.txt')).toBe('hello.txt');
        });

        it('should replace spaces with underscores', () => {
            expect(InputSanitizer.sanitizeFileName('my file name.txt')).toBe('my_file_name.txt');
        });

        it('should truncate to 255 characters', () => {
            const longName = 'a'.repeat(300) + '.txt';
            expect(InputSanitizer.sanitizeFileName(longName).length).toBeLessThanOrEqual(255);
        });
    });
});
