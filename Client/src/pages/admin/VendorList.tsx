import { useMemo, useState } from "react";
import { Search, Store } from "lucide-react";
import DataTable, {
  type TableColumn,
} from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";

type VendorStatus = "pending" | "approved" | "rejected";

interface Vendor {
  _id: string;
  ownerId: {
    name: string;
    email: string;
  };
  businessInfo: {
    businessName: string;
    businessType: string;
    place: string;
  };
  status: VendorStatus;
  createdAt: string;
}

const sampleVendors: Vendor[] = [
  {
    _id: "1",
    ownerId: {
      name: "Arun Kumar",
      email: "arun@example.com",
    },
    businessInfo: {
      businessName: "Green Leaf Restaurant",
      businessType: "Restaurant",
      place: "Kochi",
    },
    status: "pending",
    createdAt: "2026-07-20",
  },
  {
    _id: "2",
    ownerId: {
      name: "Meera S",
      email: "meera@example.com",
    },
    businessInfo: {
      businessName: "Fresh Bowl",
      businessType: "Cafe",
      place: "Kannur",
    },
    status: "approved",
    createdAt: "2026-07-17",
  },
];

const VendorList = () => {
  const [search, setSearch] = useState("");

  const filteredVendors = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return sampleVendors;
    }

    return sampleVendors.filter(
      (vendor) =>
        vendor.businessInfo.businessName
          .toLowerCase()
          .includes(searchValue) ||
        vendor.ownerId.name.toLowerCase().includes(searchValue) ||
        vendor.ownerId.email.toLowerCase().includes(searchValue),
    );
  }, [search]);

  const handleApprove = (vendorId: string) => {
    console.log("Approve vendor", vendorId);
  };

  const handleReject = (vendorId: string) => {
    console.log("Reject vendor", vendorId);
  };

  const columns: TableColumn<Vendor>[] = [
    {
      header: "Business",
      render: (vendor) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
            <Store size={19} />
          </div>

          <div>
            <p className="font-semibold text-gray-900">
              {vendor.businessInfo.businessName}
            </p>

            <p className="text-xs text-gray-500">
              {vendor.businessInfo.businessType}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Owner",
      render: (vendor) => (
        <div>
          <p className="font-medium text-gray-800">{vendor.ownerId.name}</p>
          <p className="text-xs text-gray-500">{vendor.ownerId.email}</p>
        </div>
      ),
    },
    {
      header: "Place",
      render: (vendor) => vendor.businessInfo.place,
    },
    {
      header: "Applied On",
      render: (vendor) =>
        new Date(vendor.createdAt).toLocaleDateString("en-IN"),
    },
    {
      header: "Status",
      render: (vendor) => <StatusBadge status={vendor.status} />,
    },
    {
      header: "Action",
      render: (vendor) =>
        vendor.status === "pending" ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleApprove(vendor._id)}
              className="rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100"
            >
              Approve
            </button>

            <button
              onClick={() => handleReject(vendor._id)}
              className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              Reject
            </button>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Reviewed</span>
        ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
          <p className="mt-1 text-gray-500">
            Review and manage vendor applications.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search business or owner"
            className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>
      </div>

      <div className="mt-8">
        <DataTable
          columns={columns}
          data={filteredVendors}
          emptyMessage="No vendor applications found"
          getRowKey={(vendor) => vendor._id}
        />
      </div>
    </div>
  );
};

export default VendorList;