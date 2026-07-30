import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

const AdminPublicRoute = () => {
  const { user, accessToken } = useSelector(
    (state: RootState) => state.auth
  );
  if (accessToken && user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminPublicRoute;