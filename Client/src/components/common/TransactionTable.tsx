import { useState } from "react";
import { ArrowUpRight, CheckCircle2, Receipt } from "lucide-react";
import { type WalletTransactionData } from "../../services/wallet.service";
import DataTable, { type TableColumn } from "./DataTable";
import Pagination from "./Pagination";

interface TransactionTableProps {
  transactions: WalletTransactionData[];
  title?: string;
  subtitle?: string;
}

export default function TransactionTable({
  transactions,
  title = "Transaction History",
  subtitle = "Detailed audit trail of all settlement credits and payouts.",
}: TransactionTableProps) {
  const [page, setPage] = useState(1);
  const limit = 10;
  const total = transactions.length;
  const totalPages = Math.ceil(total / limit);
  
  // Client-side pagination logic
  const paginatedTransactions = transactions.slice((page - 1) * limit, page * limit);

  const columns: TableColumn<WalletTransactionData>[] = [
    {
      header: "Transaction Details",
      render: (tx) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-700">
            <ArrowUpRight size={18} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{tx.description}</p>
            {tx.orderId && (
              <p className="text-xs font-mono text-gray-400">Order ID: {tx.orderId}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Order Total",
      render: (tx) => <span className="font-bold text-gray-900">₹{tx.orderTotal}</span>,
    },
    {
      header: "Vendor 90%",
      render: (tx) => <span className="font-bold text-green-700">+₹{tx.vendorAmount}</span>,
    },
    {
      header: "Platform 10%",
      render: (tx) => <span className="font-semibold text-amber-700">₹{tx.platformCommission}</span>,
    },
    {
      header: "Status",
      render: (tx) => (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800 border border-green-200">
          <CheckCircle2 size={12} />
          {tx.status}
        </span>
      ),
    },
    {
      header: "Date & Time",
      render: (tx) => <span className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</span>,
    },
  ];

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {total} Transactions
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center">
          <Receipt className="mx-auto text-gray-300" size={56} />
          <h4 className="mt-4 text-lg font-bold text-gray-800">
            No transactions recorded yet
          </h4>
          <p className="mt-2 text-sm text-gray-500">
            When customers pickup food and you verify their pickup code, payouts
            will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={paginatedTransactions}
            getRowKey={(tx) => tx.id}
          />
          {total > limit && (
            <Pagination
              page={page}
              limit={limit}
              total={total}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
