import { Outlet } from "react-router-dom";
import VendorSidebar from "./VendorSidebar";

const VendorLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#faf7ef]">
      <VendorSidebar />

      <main className="flex-1 overflow-x-hidden flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default VendorLayout;
