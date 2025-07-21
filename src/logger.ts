import { createLogger, format, transports, Logger as WinstonLogger } from "winston"
import fs from 'fs'
import path from 'path'
import gradient from 'gradient-string';

const logDir = 'Logs';
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const filename = path.join(logDir, `Client.log`);
const errorFilename = path.join(logDir, `Error.log`);
const debugFilename = path.join(logDir, `Debug.log`);

// Enhanced logger with multiple log files and better formatting
export const Clientlogger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: format.combine(
        format.errors({ stack: true }),
        format.label({ label: path.basename(process.mainModule?.filename ?? 'unknown') }),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] })
    ),
    transports: [
        // Console transport with colors and gradients
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(info => {
                    const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
                    const timestamp = gradient.rainbow(`${info.timestamp}`);
                    const core = gradient.pastel.multiline("XtonCore");

                    let message = `[${timestamp}] ${info.level} [${core}] [${info.label}] [${memory}MB] : ${info.message}`;

                    // Add stack trace for errors
                    if (info.stack) {
                        message += `\n${info.stack}`;
                    }

                    return message;
                })
            )
        }),

        // Main log file
        new transports.File({
            filename,
            format: format.combine(
                format.json(),
                format.timestamp()
            ),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),

        // Error-only log file
        new transports.File({
            filename: errorFilename,
            level: 'error',
            format: format.combine(
                format.json(),
                format.timestamp()
            ),
            maxsize: 5242880, // 5MB
            maxFiles: 3
        }),

        // Debug log file (only in development)
        ...(process.env.NODE_ENV !== 'production' ? [
            new transports.File({
                filename: debugFilename,
                level: 'debug',
                format: format.combine(
                    format.json(),
                    format.timestamp()
                ),
                maxsize: 10485760, // 10MB
                maxFiles: 2
            })
        ] : [])
    ],

    // Handle uncaught exceptions and rejections
    exceptionHandlers: [
        new transports.File({ filename: path.join(logDir, 'exceptions.log') })
    ],
    rejectionHandlers: [
        new transports.File({ filename: path.join(logDir, 'rejections.log') })
    ]
});

// Add custom log methods
export class EnhancedLogger {
    private logger: WinstonLogger;
    private context: string;

    constructor(logger: WinstonLogger, context: string = 'XtonCore') {
        this.logger = logger;
        this.context = context;
    }

    private formatMessage(message: string, meta?: any): string {
        return meta ? `[${this.context}] ${message} ${JSON.stringify(meta)}` : `[${this.context}] ${message}`;
    }

    public info(message: string, meta?: any): void {
        this.logger.info(this.formatMessage(message, meta));
    }

    public error(message: string, error?: any, p0?: string, reason?: unknown): void {
        if (error instanceof Error) {
            this.logger.error(this.formatMessage(message), { error: error.message, stack: error.stack });
        } else {
            this.logger.error(this.formatMessage(message, error));
        }
    }

    public warn(message: string, meta?: any): void {
        this.logger.warn(this.formatMessage(message, meta));
    }

    public debug(message: string, meta?: any): void {
        this.logger.debug(this.formatMessage(message, meta));
    }

    public verbose(message: string, meta?: any): void {
        this.logger.verbose(this.formatMessage(message, meta));
    }

    public performance(operation: string, duration: number, meta?: any): void {
        this.logger.info(this.formatMessage(`Performance: ${operation} took ${duration}ms`, meta));
    }

    public command(commandName: string, userId: string, guildId?: string): void {
        this.logger.info(this.formatMessage(`Command executed: ${commandName}`, {
            userId,
            guildId: guildId || 'DM'
        }));
    }

    public createChild(context: string): EnhancedLogger {
        return new EnhancedLogger(this.logger, `${this.context}:${context}`);
    }
}

// Export enhanced logger instance
export const Logger = new EnhancedLogger(Clientlogger);