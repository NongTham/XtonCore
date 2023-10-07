import { createLogger, format, transports } from "winston"
import fs from 'fs'
import path from 'path'
import gradient from 'gradient-string';
const logDir = 'Logs';
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
const filename = path.join(logDir, `Client.log`);
export const Clientlogger = createLogger({
    // change level if in dev environment versus production
    level: 'production' ? 'info' : 'debug',
    format: format.combine(
        //@ts-igonre
        format.label({ label: path.basename(process.mainModule.filename) }),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
    ),
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(
                    info =>
                        `[${gradient.rainbow(`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`)}][${gradient.rainbow(`${info.timestamp}`)}] ${info.level} [${gradient.pastel.multiline("XtonCore")}] [${info.label}] [Client] : ${info.message}`,
                )
            )
        }),
        new transports.File({
            filename,
            format: format.combine(
                format.printf(
                    info =>
                        `[${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB]${info.timestamp} [${info.label}] [XtonCore] ${info.level} [Client] : ${info.message}`
                )
            )
        })
    ]
});