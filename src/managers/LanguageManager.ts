import * as fs from 'fs';
import * as path from 'path';
import { Clientlogger } from '../logger';

export interface LanguageManagerOptions {
  localesPath?: string;
  defaultLocale?: string;
}

export class LanguageManager {
  private locales: Map<string, Record<string, string>> = new Map();
  private localesPath: string | undefined;
  private defaultLocale: string;

  constructor(options: LanguageManagerOptions = {}) {
    this.localesPath = options.localesPath;
    this.defaultLocale = options.defaultLocale || 'en-US';
  }

  /**
   * Load JSON translation files from the specified locales path
   */
  public async loadLocales(): Promise<number> {
    if (!this.localesPath) return 0;

    if (!fs.existsSync(this.localesPath)) {
      Clientlogger.warn(`Locales directory not found at ${this.localesPath}`);
      return 0;
    }

    this.locales.clear();
    let loadedCount = 0;

    const files = fs.readdirSync(this.localesPath).filter(file => file.endsWith('.json'));

    for (const file of files) {
      const locale = path.basename(file, '.json');
      const filePath = path.join(this.localesPath, file);

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        
        // Flatten nested JSON for easier key access (e.g., "commands.ping.desc")
        const flattened = this.flattenObject(parsed);
        this.locales.set(locale, flattened);
        loadedCount++;
      } catch (err) {
        Clientlogger.error(`Error loading locale file ${file}:`, err);
      }
    }

    Clientlogger.info(`Loaded ${loadedCount} language files (Default: ${this.defaultLocale})`);
    return loadedCount;
  }

  /**
   * Translate a key into the specified locale, with optional variable substitution.
   * If the key is not found in the locale, it falls back to the default locale.
   * If not found at all, it returns the key itself.
   * 
   * @param key The translation key, e.g. 'messages.welcome'
   * @param locale The desired locale, e.g. 'th-TH'
   * @param args Array or Object of variables to substitute into {{var}} or {0} style placeholders
   */
  public translate(key: string, locale?: string, args?: Record<string | number, any>): string {
    const targetLocale = locale || this.defaultLocale;
    let translation = this.getTranslation(key, targetLocale);

    if (translation === undefined && targetLocale !== this.defaultLocale) {
      // Fallback to default
      translation = this.getTranslation(key, this.defaultLocale);
    }

    if (translation === undefined) {
      // Key not found anywhere
      return key;
    }

    // Interpolate variables if args provided
    if (args) {
      translation = this.interpolate(translation, args);
    }

    return translation;
  }

  /**
   * Alias for translate (common in i18n libraries)
   */
  public t(key: string, locale?: string, args?: Record<string | number, any>): string {
    return this.translate(key, locale, args);
  }

  private getTranslation(key: string, locale: string): string | undefined {
    const localeData = this.locales.get(locale);
    return localeData ? localeData[key] : undefined;
  }

  private interpolate(str: string, args: Record<string | number, any>): string {
    // Matches {{key}} and {key} and {0}
    return str.replace(/\{{1,2}\s*([^}]+?)\s*\}{1,2}/g, (match, key) => {
      const val = args[key];
      return val !== undefined && val !== null ? String(val) : match;
    });
  }

  /**
   * Flattens a nested object into dot-notation keys.
   * Example: { "a": { "b": "c" } } -> { "a.b": "c" }
   */
  private flattenObject(ob: any): Record<string, string> {
    const toReturn: Record<string, string> = {};

    for (const i in ob) {
      if (!ob.hasOwnProperty(i)) continue;

      if ((typeof ob[i]) === 'object' && ob[i] !== null) {
        const flatObject = this.flattenObject(ob[i]);
        for (const x in flatObject) {
          if (!flatObject.hasOwnProperty(x)) continue;
          toReturn[i + '.' + x] = flatObject[x];
        }
      } else {
        toReturn[i] = String(ob[i]);
      }
    }
    return toReturn;
  }

  /**
   * Get loaded locales list
   */
  public getAvailableLocales(): string[] {
    return Array.from(this.locales.keys());
  }
}
