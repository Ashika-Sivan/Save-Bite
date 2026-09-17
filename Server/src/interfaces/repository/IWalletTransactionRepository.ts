import { IWalletTransaction } from "../models/IWalletTransaction.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IWalletTransactionRepository extends IBaseRepository<IWalletTransaction> {
    aggregateTotals(matchQuery: any): Promise<any[]>;
}
