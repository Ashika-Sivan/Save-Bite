import { Request, Response, NextFunction, RequestHandler } from 'express';

export const catchAsync = <
    P = Record<string, string>,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery = Record<string, unknown>
>(
    fn: (
        req: Request<P, ResBody, ReqBody, ReqQuery>,
        res: Response,
        next: NextFunction
    ) => Promise<unknown> | void
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
