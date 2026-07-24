import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import DataTable, { type TableColumn } from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import { getAllUsers, toggleUserStatus } from "../../services/admin.service";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

type StatusTab = "all" | "active" | "blocked";

const TABS: { key: StatusTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "blocked", label: "Blocked" },
];

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<StatusTab>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getAllUsers();
        console.log("User API response:", response);
        setUsers(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return users
      .filter((u) =>
        tab === "all" ? true : tab === "active" ? u.isActive : !u.isActive,
      )
      .filter((user) => {
        if (!searchValue) return true;
        const name = user.name?.toLowerCase() ?? "";
        const email = user.email?.toLowerCase() ?? "";
        return name.includes(searchValue) || email.includes(searchValue);
      });
  }, [users, search, tab]);

  const handleBlockToggle = async (user: User) => {
    try {
      const response = await toggleUserStatus(user._id);
      const updatedUser = response.data;
      setUsers((prev) =>
        prev.map((u) => (u._id === updatedUser._id ? updatedUser : u)),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const columns: TableColumn<User>[] = [
    {
      header: "User",
      render: (user) => (
        <div>
          <p className="font-semibold text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{user._id}</p>
        </div>
      ),
    },
    {
      header: "Email",
      render: (user) => <span className="text-gray-500">{user.email}</span>,
    },
    {
      header: "Role",
      render: (user) => (
        <span className="capitalize text-gray-500">{user.role}</span>
      ),
    },
    {
      header: "Joined",
      render: (user) => (
        <span className="text-gray-500">
          {new Date(user.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "Status",
      render: (user) => (
        <StatusBadge status={user.isActive ? "Active" : "Blocked"} />
      ),
    },
    {
      header: "",
      align: "right",
      render: (user) => (
        <button
          type="button"
          onClick={() => handleBlockToggle(user)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            user.isActive
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "bg-green-50 text-green-700 hover:bg-green-100"
          }`}
        >
          {user.isActive ? "Block" : "Unblock"}
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6faf5] p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Users
          </h1>
          <p className="mt-1 text-gray-500">
            View and manage registered users on SaveBite.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
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
              tab === t.key
                ? "bg-green-700 text-white"
                : "text-gray-500 hover:text-gray-900"
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
            Loading users...
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-4 text-red-600">{error}</div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredUsers}
            getRowKey={(user) => user._id}
            emptyMessage="No users found"
          />
        )}
      </div>
    </div>
  );
};

export default UserList;
