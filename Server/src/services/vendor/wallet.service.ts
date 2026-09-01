import { StatusCode } from "../../constants/statusCode";
import { IWalletSummaryResponseDTO } from "../../dtos/wallet.dto";
import { AppError } from "../../errors/AppError";
import { IVendorRepository } from "../../interfaces/repository/IVendorRepository";
import { IWalletRepository } from "../../interfaces/repository/IWalletRepository";
import { IWalletService } from "../../interfaces/service/wallet/IWallet.service";

export class WalletService implements IWalletService {
    constructor(
        private readonly _walletRepository: IWalletRepository,
        private readonly _vendorRepository: IVendorRepository
    ) {}

    async getVendorWalletSummary(ownerId: string): Promise<IWalletSummaryResponseDTO> {
        if (!ownerId) {
            throw new AppError("Vendor not authenticated", StatusCode.UNAUTHORIZED);
        }

        const vendor = await this._vendorRepository.findByOwnerId(ownerId);
        if (!vendor) {
            throw new AppError("Vendor account not found", StatusCode.NOT_FOUND);
        }

        const wallet = await this._walletRepository.getOrCreateWallet(vendor._id);
        const transactions = await this._walletRepository.getTransactionsByVendorId(vendor._id);

        return {
            wallet: {
                id: wallet._id.toString(),
                vendorId: wallet.vendorId.toString(),
                balance: wallet.balance,
                totalEarnings: wallet.totalEarnings,
                totalCommissionPaid: wallet.totalCommissionPaid,
                currency: wallet.currency,
                updatedAt: wallet.updatedAt ? wallet.updatedAt.toISOString() : new Date().toISOString(),
            },
            transactions: transactions.map((t) => ({
                id: t._id.toString(),
                walletId: t.walletId.toString(),
                vendorId: t.vendorId.toString(),
                orderId: t.orderId ? (t.orderId as unknown as { _id?: { toString(): string } })._id?.toString() || t.orderId.toString() : "",
                type: t.type,
                orderTotal: t.orderTotal,
                vendorAmount: t.vendorAmount,
                platformCommission: t.platformCommission,
                currency: t.currency,
                description: t.description,
                status: t.status,
                createdAt: t.createdAt ? t.createdAt.toISOString() : new Date().toISOString(),
            })),
        };
    }
}
