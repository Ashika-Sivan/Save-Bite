import { NextFunction, Response } from "express";
import { IVendorService } from "../interfaces/service/vendor/IVendorService";
import { AuthRequest } from "../types/authRequest";
import { StatusCode } from "../constants/statusCode";
import { VENDOR_MESSAGES, AUTH_MESSAGES } from "../constants/messages";
import { AppError } from "../errors/AppError";
import { ResponseHelper } from "../utils/ResponseHelper";

export class VendorController {
    constructor(private _vendorService: IVendorService) { }

    async registerVendor(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const ownerId = req.user?.userId; // jwt middleware
            if (!ownerId) {
                throw new AppError(
                    AUTH_MESSAGES.USER_NOT_AUTHENTICATED,
                    StatusCode.UNAUTHORIZED
                );
            }

            const files = req.files as {
                [fieldName: string]: Express.Multer.File[];
            };

            const data = {
                businessInfo: JSON.parse(req.body.businessInfo),
                verification: JSON.parse(req.body.verification),
            };

            const vendor = await this._vendorService.registerVendor(
                ownerId,
                data,
                files
            );

            ResponseHelper.success(
                res,
                StatusCode.CREATED,
                VENDOR_MESSAGES.APPLICATION_SUBMITTED,
                vendor
            );
        } catch (error) {
            next(error);
        }
    }

    async getVendorStatus(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const ownerId = req.user?.userId;
            if (!ownerId) {
                throw new AppError(
                    AUTH_MESSAGES.USER_NOT_AUTHENTICATED,
                    StatusCode.UNAUTHORIZED
                );
            }

            const status = await this._vendorService.getVendorStatus(ownerId);

            ResponseHelper.success(
                res,
                StatusCode.OK,
                VENDOR_MESSAGES.STATUS_FETCHED,
                status
            );
        } catch (error) {
            next(error);
        }
    }
}