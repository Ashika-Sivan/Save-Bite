import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import type { RootState } from "../redux/store";

const CustomerRoute = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    if (user) {
        if (user.role === "vendor") {
            return <Navigate to="/vendor/dashboard" replace />;
        }
        if (user.role === "admin") {
            return <Navigate to="/admin/dashboard" replace />;
        }
    }

    return <Outlet />;
};

export default CustomerRoute;
