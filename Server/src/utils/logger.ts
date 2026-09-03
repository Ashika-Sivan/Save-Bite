import path from "path";
import * as winston from "winston";
import "winston-daily-rotate-file";

export interface ILogger {
    info(message: string, data?: unknown): void;
    warn(message: string, data?: unknown): void;
    error(message: string, data?: unknown): void;
}

export class WinstonLogger implements ILogger {
    private logger: winston.Logger;

    constructor() {
        const logDirectory = path.resolve(process.cwd(), "logs");

        const fileFormat = winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
        );

        const consoleFormat = winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            winston.format.printf(({ timestamp, level, message, ...metadata }) => {
                const additionalData = Object.keys(metadata).length > 0 ? ` ${JSON.stringify(metadata)}` : "";
                return `${timestamp} [${level}]: ${message}${additionalData}`;
            })
        );

        const transports: winston.transport[] = [
            new winston.transports.DailyRotateFile({
                dirname: logDirectory,
                filename: "application-%DATE%.log",
                datePattern: "YYYY-MM-DD",
                level: "info",
                maxSize: "20m",
                maxFiles: "14d",
                zippedArchive: false,
            }),
            new winston.transports.DailyRotateFile({
                dirname: logDirectory,
                filename: "error-%DATE%.log",
                datePattern: "YYYY-MM-DD",
                level: "error",
                maxSize: "20m",
                maxFiles: "30d",
                zippedArchive: false,
            }),
        ];

        if (process.env.NODE_ENV !== "production") {
            transports.push(
                new winston.transports.Console({
                    format: consoleFormat,
                })
            );
        }

        this.logger = winston.createLogger({
            level: "info",
            format: fileFormat,
            transports,
            exitOnError: false,
        });
    }

    private getMetadata(data?: unknown): Record<string, unknown> {
        if (data === undefined) {
            return {};
        }

        if (data instanceof Error) {
            return {
                error: data.message,
                stack: data.stack,
            };
        }

        return { data };
    }

    public info(message: string, data?: unknown): void {
        this.logger.info(message, this.getMetadata(data));
    }

    public warn(message: string, data?: unknown): void {
        this.logger.warn(message, this.getMetadata(data));
    }

    public error(message: string, data?: unknown): void {
        this.logger.error(message, this.getMetadata(data));
    }
}

// Export a default instance named Logger to maintain compatibility with existing code
export const Logger: ILogger = new WinstonLogger();