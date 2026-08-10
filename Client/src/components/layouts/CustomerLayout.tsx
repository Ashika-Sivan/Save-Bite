import { Outlet } from "react-router-dom";

import CustomerFooter from "../customer/CustomerFooter";
import CustomerHeader from "../customer/CustomerHeader";

const CustomerLayout = () => {
    return (
        <div className="flex min-h-screen flex-col bg-[#faf7ef]">
            <CustomerHeader />

            <main className="flex-1">
                <Outlet />
            </main>

            <CustomerFooter />
        </div>
    );
};

export default CustomerLayout;