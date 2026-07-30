/* eslint-disable no-console */
export class Logger {
  static info(message: string, data?: unknown): void {
    console.log(`[INFO] ${message}`);

    if (data) {
      console.log(data);
    }
  }

  static warn(message: string, data?: unknown): void {
    console.warn(`[WARN] ${message}`);

    if (data) {
      console.warn(data);
    }
  }

  static error(message: string, data?: unknown): void {
    console.error(`[ERROR] ${message}`);

    if (data) {
      console.error(data);
    }
  }
}