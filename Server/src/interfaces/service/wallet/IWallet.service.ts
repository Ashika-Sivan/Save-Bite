import { IWalletSummaryResponseDTO } from "../../../dtos/wallet.dto";

export interface IWalletService {
    getVendorWalletSummary(ownerId: string): Promise<IWalletSummaryResponseDTO>;
}
