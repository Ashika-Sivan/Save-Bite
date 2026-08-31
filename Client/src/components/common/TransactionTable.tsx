import React from "react";
import { ArrowUpRight, Receipt, CheckCircle2 } from "lucide-react";
import { type WalletTransactionData } from "../../services/wallet.service";

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
  return (
    <div className="mt-10">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {transactions.length} Transactions
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center">
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
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4">Transaction Details</th>
                  <th className="px-6 py-4">Order Total</th>
                  <th className="px-6 py-4 text-green-700">Vendor 90%</th>
                  <th className="px-6 py-4 text-amber-700">Platform 10%</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-700">
                          <ArrowUpRight size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {tx.description}
                          </p>
                          {tx.orderId && (
                            <p className="text-xs font-mono text-gray-400">
                              Order ID: {tx.orderId}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      ₹{tx.orderTotal}
                    </td>
                    <td className="px-6 py-4 font-bold text-green-700">
                      +₹{tx.vendorAmount}
                    </td>
                    <td className="px-6 py-4 font-semibold text-amber-700">
                      ₹{tx.platformCommission}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800 border border-green-200">
                        <CheckCircle2 size={12} />
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
