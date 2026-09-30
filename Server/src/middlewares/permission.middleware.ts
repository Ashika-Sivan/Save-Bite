import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/authRequest";
import { StatusCode } from "../constants/statusCode";
import { AUTH_MESSAGES } from "../constants/messages";

export const requirePermission = (requiredPermission: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        const user = req.user;

        if (!user) {
            res.status(StatusCode.UNAUTHORIZED).json({
                success: false,
                message: AUTH_MESSAGES.TOKEN_MISSING,
            });
            return;
        }

    
        if (user.role === "vendor") {
            return next();
        }

        // If the role is sub_vendor, check specific permissions
        if (user.role === "sub_vendor") {
            if (!user.permissions || !user.permissions.includes(requiredPermission)) {
                res.status(StatusCode.FORBIDDEN).json({
                    success: false,
                    message: "You do not have permission to perform this action.",
                });
                return;
            }
            return next();
        }

        // Admin has full access
        if (user.role === "admin") {
            return next();
        }

        // Deny normal users
        res.status(StatusCode.FORBIDDEN).json({
            success: false,
            message: AUTH_MESSAGES.ACCESS_DENIED,
        });
    };
};
