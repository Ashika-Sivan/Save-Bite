import Pagination from "../../components/common/Pagination";
import { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";
import DataTable, { type TableColumn } from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import { getAllUsers, toggleUserStatus } from "../../services/admin.service";
import type { UserDTO } from "../../types/admin.types";

type StatusTab = "all" | "active" | "blocked";

const TABS: { key: StatusTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "blocked", label: "Blocked" },
];

const LIMIT = 2;

const UserList = () => {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tab, setTab] = useState<StatusTab>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getAllUsers({
        page,
        limit: LIMIT,
        search: debouncedSearch.trim() || undefined,
        status: tab === "all" ? undefined : tab,
      });
      setUsers(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [page, tab, debouncedSearch]);

  useEffect(() => {
    const loadData = async () => {
      await fetchUsers();
    };
    loadData();
  }, [fetchUsers]);

  const handleTabChange = (key: StatusTab) => {
    setTab(key);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleBlockToggle = async (user: UserDTO) => {
    try {
      const updatedUser = await toggleUserStatus(user.id);
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
    } catch (err) {
      console.log(err);
    }
  };

  const columns: TableColumn<UserDTO>[] = [
    {
      header: "User",
      render: (user) => (
        <div>
          <p className="font-semibold text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{user.id}</p>
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
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${user.isActive
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
              onChange={(e) => handleSearchChange(e.target.value)}
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
            onClick={() => handleTabChange(t.key)}
            className={`rounded-lg px-4 py-1.5 text-sm transition-colors ${tab === t.key
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
          <>
            <DataTable
              columns={columns}
              data={users}
              getRowKey={(user) => user.id}
              emptyMessage="No users found"
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

export default UserList;
