import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, MapPin, Plus, Utensils, Calendar } from "lucide-react";

import { getHotelById } from "../../services/hotel.service";
import { getTodayMenu } from "../../services/menu.service";
import type { Hotel } from "../../types/hotel.types";
import type { DailyMenu } from "../../services/menu.service";

interface ErrorResponse {
  message?: string;
}

const VendorHotelDetails = () => {
  const navigate = useNavigate();
  const { hotelId } = useParams<{ hotelId: string }>();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [todayMenu, setTodayMenu] = useState<DailyMenu | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!hotelId) return;
      try {
        setIsLoading(true);
        const [hotelRes, menuRes] = await Promise.all([
          getHotelById(hotelId).catch((e) => { throw e; }),
          getTodayMenu(hotelId).catch(() => null) // Menu might not exist for today yet
        ]);

        setHotel(hotelRes.data);
        if (menuRes && menuRes.data) {
          setTodayMenu(menuRes.data);
        }
      } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        toast.error(
          axiosError.response?.data?.message || "Failed to fetch hotel details"
        );
        navigate("/vendor/hotels");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDetails();
  }, [hotelId, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={34} className="animate-spin text-green-700" />
      </div>
    );
  }

  if (!hotel) {
    return null;
  }

  return (
    <main className="flex-1 p-5 md:p-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/vendor/hotels")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-green-700 transition hover:text-green-800 hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Hotels
        </button>

        {/* Hotel Header Section */}
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="h-64 w-full bg-green-50 sm:h-80">
            <img
              src={hotel.hotelImageUrl}
              alt={hotel.hotelName}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {hotel.hotelName}
                  </h1>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      hotel.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {hotel.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {hotel.businessType}
                </p>
                <div className="mt-3 flex items-start gap-2 text-sm text-gray-600 max-w-2xl">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-green-700" />
                  <span>
                    {hotel.address}, {hotel.place}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/vendor/hotels/${hotel._id}/menu`)}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white shadow-md hover:bg-green-800 transition"
              >
                <Plus size={20} />
                Add / Manage Today's Menu
              </button>
            </div>
          </div>
        </div>

        {/* Today's Menu Section */}
        <div className="mt-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Utensils className="text-green-700" />
              Today's Listed Food
            </h2>
            {todayMenu && (
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                todayMenu.isLive ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-600 border-gray-300'
              }`}>
                {todayMenu.isLive ? "LIVE & VISIBLE TO CUSTOMERS" : "OFFLINE"}
              </span>
            )}
          </div>

          {!todayMenu || todayMenu.items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                <Calendar size={30} className="text-gray-400" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-gray-900">
                No food listed for today yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                You haven't added any leftover food or set a pickup window for this hotel today. Add your menu to start receiving orders!
              </p>
              <button
                type="button"
                onClick={() => navigate(`/vendor/hotels/${hotel._id}/menu`)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 transition shadow-sm"
              >
                <Plus size={19} />
                Create Today's Menu
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {todayMenu.items.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col">
                  <div className="h-40 w-full bg-gray-50 relative">
                    <img src={item.itemImageUrl} alt={item.itemName} className="h-full w-full object-cover" />
                    {!item.isAvailable || item.stockQuantity === 0 ? (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Out of Stock</span>
                      </div>
                    ) : null}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 line-clamp-1">{item.itemName}</h4>
                      <p className="mt-1 text-sm font-medium text-gray-500 uppercase tracking-wider">{item.unitType}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-500 line-through">₹{item.originalPrice}</p>
                        <p className="text-xl font-bold text-green-700">₹{item.discountedPrice}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Available Stock</p>
                        <p className="text-lg font-bold text-gray-900">{item.stockQuantity}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => navigate(`/vendor/hotels/${hotel._id}/menu`)}
                        className="w-full flex items-center justify-center gap-2 rounded-lg border border-green-700 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 transition"
                      >
                        Edit Item
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default VendorHotelDetails;
