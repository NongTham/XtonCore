export class InputSanitizer {
  private static readonly DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<link/gi,
    /<meta/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi
  ];

  private static readonly SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /('|(\\')|(;)|(\\;)|(\|)|(\*)|(%)|(<)|(>)|(\{)|(\})|(\[)|(\]))/gi,
    /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/gi,
    /((\%3C)|<)((\%69)|i|(\%49))((\%6D)|m|(\%4D))((\%67)|g|(\%47))[^\n]+((\%3E)|>)/gi
  ];

  public static sanitizeString(input: string, options: {
    maxLength?: number;
    allowHtml?: boolean;
    allowSql?: boolean;
    customPatterns?: RegExp[];
  } = {}): string {
    const {
      maxLength = 2000,
      allowHtml = false,
      allowSql = false,
      customPatterns = []
    } = options;

    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input.trim();

    // Length check
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    // Remove dangerous HTML/JS patterns
    if (!allowHtml) {
      for (const pattern of this.DANGEROUS_PATTERNS) {
        sanitized = sanitized.replace(pattern, '');
      }
    }

    // Remove SQL injection patterns
    if (!allowSql) {
      for (const pattern of this.SQL_INJECTION_PATTERNS) {
        sanitized = sanitized.replace(pattern, '');
      }
    }

    // Apply custom patterns
    for (const pattern of customPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Remove null bytes and control characters
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return sanitized;
  }

  public static sanitizeDiscordContent(content: string): string {
    return this.sanitizeString(content, {
      maxLength: 2000,
      allowHtml: false,
      allowSql: false,
      customPatterns: [
        /(@everyone|@here)/gi, // Prevent mass mentions
        /discord\.gg\/[a-zA-Z0-9]+/gi, // Remove invite links
        /https?:\/\/[^\s]+\.exe/gi, // Remove executable links
      ]
    });
  }

  public static validateUserId(userId: string): boolean {
    return /^\d{17,19}$/.test(userId);
  }

  public static validateGuildId(guildId: string): boolean {
    return /^\d{17,19}$/.test(guildId);
  }

  public static validateChannelId(channelId: string): boolean {
    return /^\d{17,19}$/.test(channelId);
  }

  public static escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  public static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  public static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 255);
  }
}