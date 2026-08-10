import path from "path";
import * as winston from "winston";
import "winston-daily-rotate-file";

const logDirectory = path.resolve(
    process.cwd(),
    "logs"
);

const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({
        stack: true,
    }),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.printf(
        ({
            timestamp,
            level,
            message,
            ...metadata
        }) => {
            const additionalData =
                Object.keys(metadata).length > 0
                    ? ` ${JSON.stringify(metadata)}`
                    : "";

            return `${timestamp} [${level}]: ${message}${additionalData}`;
        }
    )
);

const applicationFileTransport =
    new winston.transports.DailyRotateFile({
        dirname: logDirectory,
        filename: "application-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        level: "info",
        maxSize: "20m",
        maxFiles: "14d",
        zippedArchive: false,
    });

const errorFileTransport =
    new winston.transports.DailyRotateFile({
        dirname: logDirectory,
        filename: "error-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        level: "error",
        maxSize: "20m",
        maxFiles: "30d",
        zippedArchive: false,
    });

const transports: winston.transport[] = [
    applicationFileTransport,
    errorFileTransport,
];

if (process.env.NODE_ENV !== "production") {
    transports.push(
        new winston.transports.Console({
            format: consoleFormat,
        })
    );
}

const logger = winston.createLogger({
    level: "info",
    format: fileFormat,
    transports,
    exitOnError: false,
});

export class Logger {
    private static getMetadata(
        data?: unknown
    ): Record<string, unknown> {
        if (data === undefined) {
            return {};
        }

        if (data instanceof Error) {
            return {
                error: data.message,
                stack: data.stack,
            };
        }

        return {
            data,
        };
    }

    static info(
        message: string,
        data?: unknown
    ): void {
        logger.info(
            message,
            Logger.getMetadata(data)
        );
    }

    static warn(
        message: string,
        data?: unknown
    ): void {
        logger.warn(
            message,
            Logger.getMetadata(data)
        );
    }

    static error(
        message: string,
        data?: unknown
    ): void {
        logger.error(
            message,
            Logger.getMetadata(data)
        );
    }
}