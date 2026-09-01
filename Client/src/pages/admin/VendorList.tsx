import Pagination from "../../components/common/Pagination";
import { useEffect, useState } from "react";
import { Search, ArrowUpRight } from "lucide-react";
import DataTable, { type TableColumn } from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import { getAllVendors } from "../../services/admin.service";
import { useNavigate } from "react-router-dom";
import type { VendorDTO, VendorStatus } from "../../types/admin.types";

const TABS: { key: "all" | VendorStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "suspended", label: "Suspended" },
  { key: "rejected", label: "Rejected" },
];

const LIMIT = 5;

const VendorList = () => {
  const [vendors, setVendors] = useState<VendorDTO[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    let ignore = false;
    const fetchVendors = async () => {
      await Promise.resolve();
      try {
        setLoading(true);
        setError("");
        const result = await getAllVendors({
          page,
          limit: LIMIT,
          search: debouncedSearch.trim() || undefined,
          status: tab === "all" ? undefined : tab,
        });
        if (!ignore) {
          setVendors(result.items);
          setTotal(result.total);
          setTotalPages(result.totalPages);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to fetch vendors");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void fetchVendors();
    return () => {
      ignore = true;
    };
  }, [page, tab, debouncedSearch]);

  const handleTabChange = (key: (typeof TABS)[number]["key"]) => {
    setTab(key);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleReview = (vendorId: string) => {
    navigate(`/admin/vendors/${vendorId}`);
  };

  const columns: TableColumn<VendorDTO>[] = [
    {
      header: "Business",
      render: (v) => (
        <div>
          <p className="font-semibold text-gray-900">{v.businessName}</p>
          <p className="text-xs text-gray-500">{v.id}</p>
        </div>
      ),
    },
    { header: "Owner", render: (v) => <span className="text-gray-500">{v.ownerName ?? "Unknown"}</span> },
    { header: "Type", render: (v) => <span className="text-gray-500">{v.businessType}</span> },
    { header: "City", render: (v) => <span className="text-gray-500">{v.place}</span> },
    {
      header: "Joined",
      render: (v) => (
        <span className="text-gray-500">
          {new Date(v.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      ),
    },
    {
      header: "Revenue",
      align: "right",
      render: (v) => <span className="font-medium">₹{(v.revenue ?? 0).toLocaleString("en-IN")}</span>,
    },
    { header: "Status", render: (v) => <StatusBadge status={v.status} /> },
    {
      header: "",
      align: "right",
      render: (v) => (
        <button
          onClick={() => handleReview(v.id)}
          className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:underline"
        >
          Review <ArrowUpRight size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6faf5] p-6 md:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Vendors</h1>
          <p className="mt-1 text-gray-500">
            Approve, suspend and audit vendor businesses on SaveBite.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search vendors..."
              className="w-72 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>
          <button className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800">
            Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex w-fit flex-wrap gap-1 rounded-xl border border-gray-200 bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`rounded-lg px-4 py-1.5 text-sm transition-colors ${tab === t.key ? "bg-green-700 text-white" : "text-gray-500 hover:text-gray-900"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center text-gray-500">
            Loading vendors...
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-4 text-red-600">{error}</div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={vendors}
              emptyMessage="No vendors match."
              getRowKey={(v) => v.id}
            />

            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={LIMIT}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default VendorList;
