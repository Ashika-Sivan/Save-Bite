import { IWalletSummaryResponseDTO } from "../../../dtos/wallet.dto";

export interface IWalletService {
    getVendorWalletSummary(ownerId: string, filters?: { startDate?: Date, endDate?: Date, sortDirection?: 'asc' | 'desc' }): Promise<IWalletSummaryResponseDTO>;
}
