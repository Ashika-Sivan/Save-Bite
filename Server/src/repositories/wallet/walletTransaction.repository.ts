import { WalletTransaction } from "../../models/wallet/walletTransaction.model";
import { IWalletTransactionRepository } from "../../interfaces/repository/IWalletTransactionRepository";
import { BaseRepository } from "../base.repository";
import { IWalletTransaction } from "../../interfaces/models/IWalletTransaction.model";

export class WalletTransactionRepository extends BaseRepository<IWalletTransaction> implements IWalletTransactionRepository {
    constructor() {
        super(WalletTransaction);
    }

    async aggregateTotals(matchQuery: any): Promise<any[]> {
        return await this._model.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    walletGross: { $sum: "$orderTotal" },
                    walletCommission: { $sum: "$platformCommission" },
                    walletVendorAmount: { $sum: "$vendorAmount" },
                    walletCount: { $sum: 1 },
                }
            }
        ]);
    }
}
