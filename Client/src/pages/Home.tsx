import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import type { RootState } from "../redux/store";
import { clearCredentials, updateUser } from "../redux/authSlice";
import { checkVendorStatus } from "../services/vendor.service";
import { logout } from "../services/auth.service";
import {
  getLiveHotelMenu,
  getLiveHotels,
  type LiveHotel,
  type LiveHotelMenu,
  type LiveMenuItem,
} from "../services/customerBrowse.service";

const categories = [
  "All",
  "Biryani",
  "Meals",
  "Pizza",
  "Chicken",
  "Fried Rice",
  "Burger",
  "Beverages",
  "Snacks",
  "Desserts",
];

const fallbackRestaurantImage =
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800";

const getImageUrl = (imageKey: string): string => {
  if (/^https?:\/\//i.test(imageKey)) return imageKey;

  const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;
  return imageBaseUrl
    ? `${imageBaseUrl.replace(/\/$/, "")}/${imageKey}`
    : fallbackRestaurantImage;
};

const formatTime = (date: string): string =>
  new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));

interface DisplayMenuItem extends LiveMenuItem {
  hotelId: string;
  hotelName: string;
  hotelImageKey: string;
}
interface CustomerLocation {
  latitude: number;
  longitude: number;
}

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [open, setOpen] = useState(false);
  const [hotels, setHotels] = useState<LiveHotel[]>([]);
  const [menus, setMenus] = useState<LiveHotelMenu[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerLocation, setCustomerLocation] =
    useState<CustomerLocation | null>(() => {
      const savedLocation = localStorage.getItem(
        "customerLocation"
      );

      return savedLocation
        ? JSON.parse(savedLocation)
        : null;
    });

  const [isGettingLocation, setIsGettingLocation] =
    useState(false)



  const handleUseCurrentLocation = (): void => {
    if (!navigator.geolocation) {
      toast.error(
        "Location is not supported by your browser"
      );
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: CustomerLocation = {
          latitude:
            position.coords.latitude,
          longitude:
            position.coords.longitude,
        };

        setCustomerLocation(location);

        localStorage.setItem(
          "customerLocation",
          JSON.stringify(location)
        );

        setIsGettingLocation(false);

        toast.success(
          "Location set successfully"
        );
      },

      (locationError) => {
        console.error(
          "Unable to get location:",
          locationError
        );

        setIsGettingLocation(false);

        toast.error(
          "Please allow location access"
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  useEffect(() => {
    const loadLiveHotels = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getLiveHotels({ page: 1, limit: 50, latitude: customerLocation?.latitude, longitude: customerLocation?.longitude });
        const liveHotels = response.data.hotels;
        setHotels(liveHotels);

        const menuResults = await Promise.allSettled(
          liveHotels.map((hotel) => getLiveHotelMenu(hotel.hotelId))
        );

        setMenus(
          menuResults.flatMap((result) =>
            result.status === "fulfilled" ? [result.value.data] : []
          )
        );
      } catch (requestError) {
        console.error("Failed to load live hotels:", requestError);
        setError("Unable to load live restaurants. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === "user") {
      void loadLiveHotels();
    } else {
      setHotels([]);
      setMenus([]);
      setIsLoading(false);
    }
  }, [user?.role, customerLocation]);

  const visibleHotels = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return hotels;

    return hotels.filter((hotel) =>
      [hotel.hotelName, hotel.businessType, hotel.place, hotel.address]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [hotels, searchTerm]);

  const visibleItems = useMemo<DisplayMenuItem[]>(() => {
    const query = searchTerm.trim().toLowerCase();

    return menus
      .flatMap((menu) =>
        menu.items.map((item) => ({
          ...item,
          hotelId: menu.hotelId,
          hotelName: menu.hotelName,
          hotelImageKey: menu.hotelImageKey,
        }))
      )
      .filter((item) => {
        const matchesSearch =
          !query ||
          `${item.itemName} ${item.hotelName}`.toLowerCase().includes(query);
        const matchesCategory =
          selectedCategory === "All" ||
          item.itemName.toLowerCase().includes(selectedCategory.toLowerCase());

        return matchesSearch && matchesCategory;
      });
  }, [menus, searchTerm, selectedCategory]);

  const handleBecomeVendor = async () => {
    try {
      if (!user) {
        navigate("/login");
        return;
      }

      const response = await checkVendorStatus();
      const { hasApplication, status } = response.data;

      if (!hasApplication) return navigate("/vendor/VendorRegister");
      if (status === "pending") return navigate("/vendor/pending");
      if (status === "rejected") return navigate("/vendor/rejected");

      if (status === "approved") {
        dispatch(updateUser({ role: "vendor" }));
        navigate("/vendor/dashboard");
      }
    } catch (requestError) {
      console.error("Failed to check vendor status:", requestError);
      toast.error("Unable to check vendor status");
    }
  };

  const confirmLogout = async (toastId: string) => {
    toast.dismiss(toastId);
    try {
      await logout();
      dispatch(clearCredentials());
      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    } catch (requestError) {
      console.error("Logout failed:", requestError);
      toast.error("Logout failed. Please try again.");
    }
  };

  const handleLogout = () => {
    setOpen(false);
    toast.custom(
      (currentToast) => (
        <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
          <h3 className="font-semibold text-gray-900">Confirm logout</h3>
          <p className="mt-1 text-sm text-gray-600">Are you sure you want to log out?</p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => toast.dismiss(currentToast.id)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => confirmLogout(currentToast.id)}
              className="rounded-lg bg-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-green-900"
            >
              Yes, Logout
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: "top-center" }
    );
  };

  const scrollToRestaurants = () => {
    document.getElementById("live-restaurants")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#faf7ef] px-3 py-5 text-gray-900 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-gray-200 bg-[#faf7ef] shadow-lg">

        <main>
          <section className="mx-auto mt-8 max-w-6xl px-5">
            <div className="grid items-center gap-8 rounded-3xl border border-green-700 bg-green-800 p-8 text-white shadow-lg md:grid-cols-2 md:p-12">
              <div>
                <p className="mb-3 text-sm text-green-100">Fresh leftovers near you</p>
                <h2 className="text-4xl font-bold leading-tight md:text-5xl">Hot food. Half the price.<br />Pick it up nearby.</h2>
                <p className="mt-4 max-w-md text-green-100">Discover surplus food from restaurants around you and rescue meals at discounted prices.</p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <button onClick={scrollToRestaurants} className="rounded-full border border-orange-400 bg-orange-500 px-5 py-3 text-sm font-semibold hover:bg-orange-600">Browse restaurants</button>
                  {user?.role === "vendor" ? (
                    <button
                      type="button"
                      onClick={() => navigate("/vendor/dashboard")}
                      className="rounded-full border border-white/30 bg-white/15 px-5 py-3 text-sm font-semibold hover:bg-white/25"
                    >
                      Go to Vendor Dashboard
                    </button>
                  ) : user?.role !== "admin" ? (
                    <button
                      type="button"
                      onClick={handleBecomeVendor}
                      className="rounded-full border border-white/30 bg-white/15 px-5 py-3 text-sm font-semibold hover:bg-white/25"
                    >
                      Become a Vendor
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=700" alt="Fresh food" className="h-72 w-full rounded-2xl border border-white/20 object-cover" />
                <div className="absolute -bottom-5 left-5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow">
                  <p className="text-xl font-bold">{hotels.length}</p>
                  <p className="text-xs">restaurants live now</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-6xl px-5">
            <h3 className="mb-4 font-semibold">What are you craving?</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`min-w-fit rounded-xl border px-4 py-3 text-sm transition ${selectedCategory === category ? "border-green-700 bg-green-700 text-white" : "border-gray-200 bg-white hover:border-green-700 hover:text-green-700"}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>


          <section id="live-restaurants" className="mx-auto mt-10 max-w-6xl px-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="font-semibold">Restaurants near you</h3>
                <p className="mt-1 text-sm text-gray-500">Currently live and accepting orders</p>
              </div>
            </div>

            {isLoading && <p className="mt-5 rounded-xl bg-white p-6 text-center text-gray-500">Loading live restaurants...</p>}
            {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">{error}</p>}
            {!user && !isLoading && <p className="mt-5 rounded-xl bg-white p-6 text-center text-gray-600">Please log in to browse live restaurants.</p>}
            {user && !isLoading && !error && visibleHotels.length === 0 && <p className="mt-5 rounded-xl bg-white p-6 text-center text-gray-500">No restaurants are live right now.</p>}

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleHotels.map((hotel) => (
                <article key={hotel.hotelId} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <img src={getImageUrl(hotel.hotelImageKey)} onError={(event) => { event.currentTarget.src = fallbackRestaurantImage; }} alt={hotel.hotelName} className="h-40 w-full object-cover" />
                  <div className="p-4">
                    <div className="flex justify-between gap-3">
                      <h4 className="font-semibold">{hotel.hotelName}</h4>
                      {hotel.distanceInMeters !== undefined && <span className="text-xs font-medium text-green-700">{(hotel.distanceInMeters / 1000).toFixed(1)} km</span>}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{hotel.place}</p>
                    <p className="mt-2 text-xs text-gray-500">Pickup: {formatTime(hotel.pickupWindow.startTime)} – {formatTime(hotel.pickupWindow.endTime)}</p>
                    <p className="mt-1 text-xs font-medium text-orange-600">{hotel.availableItemCount} items available</p>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/customer/restaurants/${hotel.hotelId}/menu`
                        )
                      }
                      className="mt-4 w-full rounded-full border border-gray-300 py-2 text-sm hover:border-green-700 hover:text-green-700"
                    >
                      View Menu
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="today-menu" className="mx-auto mt-10 max-w-6xl px-5 pb-12">
            <h3 className="font-semibold">Today&apos;s menu</h3>
            <p className="mb-5 mt-1 text-sm text-gray-500">Available now at discounted prices</p>

            {!isLoading && user && visibleItems.length === 0 && <p className="rounded-xl bg-white p-6 text-center text-gray-500">No matching menu items are available.</p>}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleItems.map((item) => (
                <article key={`${item.hotelId}-${item.itemId}`} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="relative">
                    <img src={item.itemImageUrl||getImageUrl(item.hotelImageKey)} onError={(event) => { event.currentTarget.src = getImageUrl(item.hotelImageKey) }} alt={item.itemName} className="h-40 w-full object-cover" />
                    {item.stockQuantity <= 5 && <span className="absolute left-3 top-3 rounded-full border border-red-400 bg-red-500 px-3 py-1 text-xs text-white">Only {item.stockQuantity} left</span>}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold">{item.itemName}</h4>
                    <p className="text-sm text-gray-500">{item.hotelName} · {item.unitType}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-sm text-gray-400 line-through">₹{item.originalPrice}</span>
                        <span className="ml-2 font-bold text-green-800">₹{item.discountedPrice}</span>
                      </div>
                      <button onClick={() => toast("Cart will be connected in the order-placement step")} className="rounded-full border border-green-700 bg-green-700 px-4 py-2 text-sm text-white hover:bg-green-800">Add to cart</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}