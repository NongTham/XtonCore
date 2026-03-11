import { LanguageManager } from '../../src/managers/LanguageManager';
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

describe('LanguageManager', () => {
  let manager: LanguageManager;
  const tempLocalesDir = path.join(__dirname, 'temp_locales');

  beforeAll(() => {
    if (!fs.existsSync(tempLocalesDir)) {
      fs.mkdirSync(tempLocalesDir);
    }

    // Create en-US.json
    fs.writeFileSync(path.join(tempLocalesDir, 'en-US.json'), JSON.stringify({
      greeting: "Hello, {{name}}!",
      messages: {
        error: "An error occurred: {errorObj}",
        success: "Operation successful."
      },
      arrayTest: "First is {0}, second is {1}"
    }));

    // Create th-TH.json
    fs.writeFileSync(path.join(tempLocalesDir, 'th-TH.json'), JSON.stringify({
      greeting: "สวัสดี, {{name}}!",
      messages: {
        error: "เกิดข้อผิดพลาด: {errorObj}"
      }
      // Note: success is missing to test fallback
    }));
  });

  afterAll(() => {
    if (fs.existsSync(tempLocalesDir)) {
      fs.rmSync(tempLocalesDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    manager = new LanguageManager({
      localesPath: tempLocalesDir,
      defaultLocale: 'en-US'
    });
  });

  describe('loadLocales', () => {
    it('should successfully load valid locale files', async () => {
      const loaded = await manager.loadLocales();
      expect(loaded).toBe(2);
      expect(manager.getAvailableLocales()).toEqual(expect.arrayContaining(['en-US', 'th-TH']));
    });

    it('should return 0 when path is not provided', async () => {
      const emptyManager = new LanguageManager();
      const loaded = await emptyManager.loadLocales();
      expect(loaded).toBe(0);
    });

    it('should return 0 when directory does not exist', async () => {
      const badManager = new LanguageManager({ localesPath: './does-not-exist' });
      const loaded = await badManager.loadLocales();
      expect(loaded).toBe(0);
    });
  });

  describe('translate / t', () => {
    beforeEach(async () => {
      await manager.loadLocales();
    });

    it('should translate direct keys', () => {
      expect(manager.translate('greeting', 'en-US', { name: 'John' })).toBe('Hello, John!');
      expect(manager.t('greeting', 'th-TH', { name: 'John' })).toBe('สวัสดี, John!');
    });

    it('should resolve nested keys', () => {
      expect(manager.t('messages.error', 'en-US', { errorObj: '404' })).toBe('An error occurred: 404');
      expect(manager.translate('messages.error', 'th-TH', { errorObj: '404' })).toBe('เกิดข้อผิดพลาด: 404');
    });

    it('should fallback to default locale if key missing', () => {
      // 'messages.success' exists in en-US but not th-TH
      expect(manager.t('messages.success', 'th-TH')).toBe('Operation successful.');
    });

    it('should return the raw key if completely missing', () => {
      expect(manager.t('missing.key', 'en-US')).toBe('missing.key');
      expect(manager.t('missing.key', 'th-TH')).toBe('missing.key');
    });

    it('should use default locale if locale is omitted/undefined', () => {
      expect(manager.t('messages.success')).toBe('Operation successful.');
    });

    it('should support array-based index interpolation', () => {
      expect(manager.t('arrayTest', 'en-US', ['Apple', 'Banana'])).toBe('First is Apple, second is Banana');
    });
  });
});
