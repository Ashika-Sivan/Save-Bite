import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/authRequest";
import { UserWalletService } from "../services/wallet/userWallet.service";
import { StatusCode } from "../constants/statusCode";
import { WALLET_MESSAGES } from "../constants/messages";
import { ResponseHelper } from "../utils/ResponseHelper";

export class UserWalletController {
    private _userWalletService: UserWalletService;

    constructor() {
        this._userWalletService = new UserWalletService();
    }

    getWallet = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const customerId = req.user?.userId;
            if (!customerId) {
                return res.status(StatusCode.UNAUTHORIZED).json({ message: "Unauthorized" });
            }

            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
            const search = (req.query.search as string || "").trim();
            const type = (req.query.type as string || "").trim();

            console.log(`Fetching wallet for customer: ${customerId}, page: ${page}, search: ${search}, type: ${type}`);
            const result = await this._userWalletService.getTransactionHistory(customerId, page, limit, search, type);
            console.log("Found transactions:", result.transactions.length);

            return ResponseHelper.success(res, StatusCode.OK, WALLET_MESSAGES.FETCHED_SUCCESS, result);
        } catch (error) {
            console.error("Error in getWallet:", error);
            next(error);
        }
    };
}
