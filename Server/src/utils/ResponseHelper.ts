import { Response } from "express";

export interface APIResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: any;
}

export class ResponseHelper {
    static success<T>(
        res: Response,
        statusCode: number,
        message: string,
        data?: T
    ): Response {
        const response: APIResponse<T> = {
            success: true,
            message,
            data
        };
        return res.status(statusCode).json(response);
    }

    static error(
        res: Response,
        statusCode: number,
        message: string,
        errors?: any
    ): Response {
        const response: APIResponse = {
            success: false,
            message,
            errors
        };
        return res.status(statusCode).json(response);
    }
}