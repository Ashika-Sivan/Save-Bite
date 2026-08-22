import { NextFunction, Response } from "express";
import { AUTH_MESSAGES } from "../constants/messages";
import { StatusCode } from "../constants/statusCode";
import { AppError } from "../errors/AppError";
import { IWalletService } from "../interfaces/service/wallet/IWallet.service";
import { AuthRequest } from "../types/authRequest";
import { ResponseHelper } from "../utils/ResponseHelper";

export class WalletController {
    constructor(private readonly _walletService: IWalletService) {}

    async getVendorWalletSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const ownerId = req.user?.userId;
            if (!ownerId) {
                throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED, StatusCode.UNAUTHORIZED);
            }
            const summary = await this._walletService.getVendorWalletSummary(ownerId);
            ResponseHelper.success(res, StatusCode.OK, "Vendor wallet summary fetched successfully", summary);
        } catch (error) {
            next(error);
        }
    }
}
