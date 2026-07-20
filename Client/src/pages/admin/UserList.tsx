import { useMemo, useState } from "react";
import { Search, UserRound } from "lucide-react";
import DataTable, {
  type TableColumn,
} from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const sampleUsers: User[] = [
  {
    _id: "1",
    name: "Ashika Sivan",
    email: "ashika@example.com",
    role: "user",
    isActive: true,
    createdAt: "2026-07-20",
  },
  {
    _id: "2",
    name: "Rahul Nair",
    email: "rahul@example.com",
    role: "user",
    isActive: false,
    createdAt: "2026-07-18",
  },
];

const UserList = () => {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return sampleUsers;
    }

    return sampleUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue),
    );
  }, [search]);

  const handleBlockToggle = (user: User) => {
    console.log(user.isActive ? "Block user" : "Unblock user", user._id);
  };

  const columns: TableColumn<User>[] = [
    {
      header: "User",
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
            <UserRound size={19} />
          </div>

          <div>
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      render: (user) => (
        <span className="capitalize text-gray-700">{user.role}</span>
      ),
    },
    {
      header: "Joined",
      render: (user) =>
        new Date(user.createdAt).toLocaleDateString("en-IN"),
    },
    {
      header: "Status",
      render: (user) => (
        <StatusBadge status={user.isActive ? "Active" : "Blocked"} />
      ),
    },
    {
      header: "Action",
      render: (user) => (
        <button
          onClick={() => handleBlockToggle(user)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
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
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-gray-500">
            View and manage registered SaveBite users.
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
            placeholder="Search name or email"
            className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>
      </div>

      <div className="mt-8">
        <DataTable
          columns={columns}
          data={filteredUsers}
          emptyMessage="No users found"
          getRowKey={(user) => user._id}
        />
      </div>
    </div>
  );
};

export default UserList;