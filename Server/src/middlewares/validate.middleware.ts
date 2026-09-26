import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError, ZodTypeAny } from "zod";
import { AppError } from "../errors/AppError";
import { StatusCode } from "../constants/statusCode";

export const validateRequest = (schema: ZodTypeAny) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error: any) {
            if (error instanceof ZodError) {
                const zodError = error as any;
                const errorMessage = zodError.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
                next(new AppError(errorMessage, StatusCode.BAD_REQUEST));
            } else {
                next(error);
            }
        }
    };
};
