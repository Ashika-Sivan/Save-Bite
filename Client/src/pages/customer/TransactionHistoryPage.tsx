import { useEffect, useState, useRef } from "react";
import { getCustomerWalletSummary, type CustomerWalletSummaryData } from "../../services/wallet.service";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
import { Wallet, ArrowDownRight, ArrowUpRight, Clock, Search, Filter } from "lucide-react";
import Pagination from "../../components/common/Pagination";

interface ErrorResponse {
    message?: string;
}

const TransactionHistoryPage = () => {
    const [walletData, setWalletData] = useState<CustomerWalletSummaryData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [type, setType] = useState("");
    const itemsPerPage = 10;

    const fetchWalletData = async (page: number, searchQuery: string, filterType: string) => {
        try {
            setIsLoading(true);
            setErrorMessage("");
            const response = await getCustomerWalletSummary(page, itemsPerPage, searchQuery, filterType);
            setWalletData(response.data);
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            setErrorMessage(axiosError.response?.data?.message || "Failed to load wallet data.");
            toast.error("Unable to load wallet data");
        } finally {
            setIsLoading(false);
        }
    };

    // Use a ref to keep track of the debounce timer
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            fetchWalletData(currentPage, search, type);
        }, 500);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [currentPage, search, type]);

    if (isLoading && !walletData) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (errorMessage && !walletData) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mx-auto max-w-lg mt-8">
                {errorMessage}
            </div>
        );
    }

    const transactions = walletData?.transactions || [];
    const totalPages = walletData?.totalPages || 1;
    const totalItems = walletData?.totalItems || 0;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Wallet className="w-8 h-8 mr-3 text-brand" />
                Transaction History
            </h1>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1); // Reset to page 1 on new search
                        }}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <select
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md border"
                        value={type}
                        onChange={(e) => {
                            setType(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">All Transactions</option>
                        <option value="CREDIT">Credits Only</option>
                        <option value="DEBIT">Debits Only</option>
                    </select>
                </div>
            </div>

            {/* Transactions History */}
            <div className="relative min-h-[400px]">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                        <LoadingSpinner />
                    </div>
                )}
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-gray-500" />
                    Recent Activity
                </h2>

                {transactions.length === 0 ? (
                    <EmptyState
                        title="No transactions found"
                        description="Adjust your search or filter to find what you're looking for."
                        icon={<Wallet className="w-12 h-12 text-gray-400" />}
                    />
                ) : (
                    <>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <ul className="divide-y divide-gray-100">
                                {transactions.map((tx) => (
                                    <li key={tx.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-start space-x-3">
                                                <div className={`p-2 rounded-full ${
                                                    tx.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                }`}>
                                                    {tx.type === 'CREDIT' ? (
                                                        <ArrowDownRight className="w-5 h-5" />
                                                    ) : (
                                                        <ArrowUpRight className="w-5 h-5" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                                        {tx.description}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(tx.createdAt).toLocaleString(undefined, {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                    {tx.orderId && (
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            {tx.hotelName ? `Order from ${tx.hotelName} ` : 'Order '}
                                                            (#{tx.orderId.substring(tx.orderId.length - 5).toUpperCase()})
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`text-right font-semibold ${
                                                tx.type === 'CREDIT' ? 'text-green-600' : 'text-gray-900'
                                            }`}>
                                                {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        {totalPages > 1 && (
                            <div className="mt-6 flex justify-center">
                                <Pagination
                                    page={currentPage}
                                    totalPages={totalPages}
                                    total={totalItems}
                                    limit={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TransactionHistoryPage;
