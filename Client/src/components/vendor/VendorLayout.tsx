import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import VendorSidebar from "./VendorSidebar";
import { Menu } from "lucide-react";

const VendorLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#faf7ef] overflow-hidden">
   
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:static md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <VendorSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
     
        <div className="flex items-center justify-between bg-white p-4 border-b border-gray-200 md:hidden flex-shrink-0 z-30">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-700 text-white text-sm">
              🍃
            </div>
            <span className="font-bold text-green-700">SaveBite Vendor</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 focus:outline-none">
            <Menu size={24} />
          </button>
        </div>

      
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default VendorLayout;
