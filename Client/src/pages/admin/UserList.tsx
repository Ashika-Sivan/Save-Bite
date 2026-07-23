import { useEffect, useMemo, useState } from "react";
import { Search, UserRound } from "lucide-react";

import DataTable, {
  type TableColumn
} from "../../components/common/DataTable";

import StatusBadge from "../../components/common/StatusBadge";
import { getAllUsers,toggleUserStatus} from "../../services/admin.service";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAllUsers();//call api

        console.log("User API response:", response);

        setUsers(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch users"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return users;
    }

    return users.filter((user) => {
      const name = user.name?.toLowerCase() ?? "";
      const email = user.email?.toLowerCase() ?? "";

      return (
        name.includes(searchValue) ||
        email.includes(searchValue)
      );
    });
  }, [users, search]);

  const handleBlockToggle = async(user: User) => {
    try {
      const response=await toggleUserStatus(user._id)
      const updatedUser=response.data;
      setUsers((prevUsers) =>
      prevUsers.map((currentUser) =>
        currentUser._id === updatedUser._id
          ? updatedUser
          : currentUser
      )
    );
      
      
    } catch (error) {
      console.log(error)
      
    }
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
            <p className="font-semibold text-gray-900">
              {user.name}
            </p>

            <p className="text-xs text-gray-500">
              {user.email}
            </p>
          </div>
        </div>
      )
    },
    {
      header: "Role",
      render: (user) => (
        <span className="capitalize">
          {user.role}
        </span>
      )
    },
    {
      header: "Joined On",
      render: (user) =>
        new Date(user.createdAt).toLocaleDateString("en-IN")
    },
    {
      header: "Status",
      render: (user) => (
        <StatusBadge
          status={user.isActive ? "Active" : "Blocked"}
        />
      )
    },
    {
      header: "Action",
      render: (user) => (
        <button
          type="button"
          onClick={() => handleBlockToggle(user)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            user.isActive
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "bg-green-50 text-green-700 hover:bg-green-100"
          }`}
        >
          {user.isActive ? "Block" : "Unblock"}
        </button>
      )
    }
  ];

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Users
          </h1>

          <p className="mt-1 text-gray-500">
            View and manage registered users.
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
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search name or email"
            className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>
      </div>

      <div className="mt-8">
        <DataTable
          columns={columns}
          data={filteredUsers}
          getRowKey={(user) => user._id}
          emptyMessage="No users found"
        />
      </div>
    </div>
  );
};

export default UserList;