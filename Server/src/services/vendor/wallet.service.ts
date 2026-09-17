import { StatusCode } from "../../constants/statusCode";
import { IWalletSummaryResponseDTO } from "../../dtos/wallet.dto";
import { AppError } from "../../errors/AppError";
import { IVendorRepository } from "../../interfaces/repository/IVendorRepository";
import { IWalletRepository } from "../../interfaces/repository/IWalletRepository";
import { IWalletService } from "../../interfaces/service/wallet/IWallet.service";
import { AUTH_MESSAGES, VENDOR_MESSAGES } from "../../constants/messages";
import { toWalletSummaryResponseDTO } from "../../mappers/wallet.mapper";

export class WalletService implements IWalletService {
    constructor(
        private readonly _walletRepository: IWalletRepository,
        private readonly _vendorRepository: IVendorRepository
    ) {}

    async getVendorWalletSummary(ownerId: string): Promise<IWalletSummaryResponseDTO> {
        if (!ownerId) {
            throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED, StatusCode.UNAUTHORIZED);
        }

        const vendor = await this._vendorRepository.findByOwnerId(ownerId);
        if (!vendor) {
            throw new AppError(VENDOR_MESSAGES.VENDOR_NOT_FOUND, StatusCode.NOT_FOUND);
        }

        const wallet = await this._walletRepository.getOrCreateWallet(vendor._id);
        const transactions = await this._walletRepository.getTransactionsByVendorId(vendor._id);

        return toWalletSummaryResponseDTO(wallet, transactions);
    }
}
