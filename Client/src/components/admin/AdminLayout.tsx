import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#f6faf5]">
      <AdminSidebar />

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;