export interface IAdminTransactionService {
    getOverview(): Promise<any>;
    getVendorBreakdown(
        page: number,
        limit: number,
        search: string,
        businessTypeFilter: string,
        sortAdminEarned?: "desc" | "asc"
    ): Promise<any>;
    getRecentTransactions(
        page: number,
        limit: number,
        search: string,
        statusFilter?: string
    ): Promise<any>;
    getRefundReport(
        page: number,
        limit: number,
        search: string
    ): Promise<any>;
}
