import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import {
  Building2,
  ChevronRight,
  Loader2,
  MapPin,
  Plus,
  Utensils,
} from "lucide-react";

import { getVendorHotels } from "../../services/hotel.service";
import type { Hotel } from "../../types/hotel.types";

interface ErrorResponse {
  message?: string;
}

const HotelList = () => {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await getVendorHotels();
        setHotels(response.data);
      } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;

        toast.error(
          axiosError.response?.data?.message ||
            "Failed to fetch hotels"
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchHotels();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2
          size={34}
          className="animate-spin text-green-700"
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f3] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hotel List
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your hotels and today’s available food.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/vendor/hotels/add")}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
          >
            <Plus size={19} />
            Add Hotel
          </button>
        </div>

        {hotels.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <Building2 size={30} className="text-green-700" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              No hotels added yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Add your first hotel to begin creating today’s menu
              and accepting food-rescue orders.
            </p>

            <button
              type="button"
              onClick={() => navigate("/vendor/hotels/add")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
            >
              <Plus size={19} />
              Add your first hotel
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {hotels.map((hotel) => (
              <article
                key={hotel._id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="h-44 w-full overflow-hidden bg-green-50">
                  <img src={hotel.hotelImageUrl} alt={hotel.hotelName} className="h-full w-full object-cover" />
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {hotel.hotelName}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {hotel.businessType}
                      </p>
                    </div>

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

                  <div className="mt-4 flex items-start gap-2 text-sm text-gray-600">
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-green-700"
                    />

                    <span>
                      {hotel.address}, {hotel.place}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/vendor/hotels/${hotel._id}/menu`
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-green-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
                    >
                      <Utensils size={17} />
                      Today’s Menu
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/vendor/hotels/${hotel._id}`)
                      }
                      className="flex items-center justify-center gap-1 rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      View
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default HotelList;