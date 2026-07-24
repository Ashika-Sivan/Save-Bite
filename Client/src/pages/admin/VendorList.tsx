  
import { useEffect, useMemo, useState } from "react";
import { Search, ArrowUpRight } from "lucide-react";
import DataTable, { type TableColumn } from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import { getAllVendors } from "../../services/admin.service";
import { useNavigate } from "react-router-dom";

type VendorStatus = "pending" | "approved" | "rejected" | "suspended";

interface Vendor {
  id: string;
  ownerName: string;
  ownerEmail: string;
  businessName: string;
  businessType: string;
  place: string;
  status: VendorStatus;
  isLive: boolean;
  createdAt: string;
  revenue?: number;
}

const TABS: { key: "all" | VendorStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "suspended", label: "Suspended" },
  { key: "rejected", label: "Rejected" },
];

const VendorList = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getAllVendors();
        console.log("vendor api responses", response);
        setVendors(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch vendors");
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const filteredVendors = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return vendors
      .filter((v) => (tab === "all" ? true : v.status === tab))
      .filter((v) => {
        if (!searchValue) return true;
        const businessName = v.businessName?.toLowerCase() ?? "";
        const ownerName = v.ownerName?.toLowerCase() ?? "";
        const ownerEmail = v.ownerEmail?.toLowerCase() ?? "";
        return (
          businessName.includes(searchValue) ||
          ownerName.includes(searchValue) ||
          ownerEmail.includes(searchValue)
        );
      });
  }, [search, tab, vendors]);

 const handleReview = (vendorId: string) => {
  navigate(`/admin/vendors/${vendorId}`);
};

  const columns: TableColumn<Vendor>[] = [
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
              onChange={(e) => setSearch(e.target.value)}
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
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-1.5 text-sm transition-colors ${
              tab === t.key ? "bg-green-700 text-white" : "text-gray-500 hover:text-gray-900"
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
          <DataTable
            columns={columns}
            data={filteredVendors}
            emptyMessage="No vendors match."
            getRowKey={(v) => v.id}
          />
        )}
      </div>
    </div>
  );
};

export default VendorList;

