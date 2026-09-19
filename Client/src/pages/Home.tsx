import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import type { RootState } from "../redux/store";
import { APP_ROUTES } from "../constants/appRoutes";
import { updateUser } from "../redux/authSlice";
import { checkVendorStatus } from "../services/vendor.service";
import {
  getLiveHotelMenu,
  getLiveHotels,
  type LiveHotel,
  type LiveHotelMenu,
  type LiveMenuItem,
} from "../services/customerBrowse.service";
import { addToCart, replaceCart, type AddToCartPayload } from "../redux/cartSlice";

// Removed static categories array

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
  const { user } = useSelector((state: RootState) => state.auth);
  const { liveHotelIds } = useSelector((state: RootState) => state.notification);
  const cartHotelId = useSelector((state: RootState) => state.cart.hotelId);

  const handleAddToCartFromHome = (item: DisplayMenuItem) => {
    if (!user) {
      toast.custom(
        (currentToast) => (
          <div className="w-full max-w-sm rounded-[2rem] border border-gray-200 bg-white p-5 shadow-lg">
            <h3 className="font-display font-semibold text-gray-900">
              Authentication Required
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Please login to add items to your cart and continue ordering.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => toast.dismiss(currentToast.id)}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.dismiss(currentToast.id)
                  navigate("/login")
                }}
                className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90"
              >
                Login
              </button>
            </div>
          </div>
        ),
        { duration: Infinity, position: "top-center" }
      );
      return;
    }

    const menu = menus.find((m) => m.hotelId === item.hotelId);
    if (!menu) {
      toast.error("Restaurant menu not found");
      return;
    }

    const payload: AddToCartPayload = {
      hotelId: menu.hotelId,
      menuId: menu.menuId,
      hotelName: menu.hotelName,
      pickupWindow: {
        startTime: menu.pickupWindow.startTime,
        endTime: menu.pickupWindow.endTime,
      },
      itemId: item.itemId,
      itemName: item.itemName,
      unitType: item.unitType,
      originalPrice: item.originalPrice,
      discountedPrice: item.discountedPrice,
      availableStock: item.stockQuantity,
      quantity: 1,
      hotelImageKey: item.hotelImageKey,
      itemImageUrl: item.itemImageUrl,
    };

    if (cartHotelId && cartHotelId !== menu.hotelId) {
      toast.custom(
        (currentToast) => (
          <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-5 shadow-lg">
            <h3 className="font-semibold text-gray-900">Replace current cart?</h3>
            <p className="mt-2 text-sm text-gray-600">
              Your cart contains food from another restaurant. Clear it and add food from {menu.hotelName}?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => toast.dismiss(currentToast.id)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.dismiss(currentToast.id);
                  dispatch(replaceCart(payload));
                  toast.success(`Added ${item.itemName} to cart`);
                  navigate("/cart");
                }}
                className="rounded-lg bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-green-900"
              >
                Clear & Add
              </button>
            </div>
          </div>
        ),
        { duration: Infinity, position: "top-center" }
      );
      return;
    }

    dispatch(addToCart(payload));
    toast.success(`Added ${item.itemName} to cart`);
    // navigate("/cart");
  };

  const [hotels, setHotels] = useState<LiveHotel[]>([]);
  const [menus, setMenus] = useState<LiveHotelMenu[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerLocation] =
    useState<CustomerLocation | null>(() => {
      const savedLocation = localStorage.getItem(
        "customerLocation"
      );

      return savedLocation
        ? JSON.parse(savedLocation)
        : null;
    });



  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const loadLiveHotels = async () => {
      await Promise.resolve();
      if (user && user.role !== "user") {
        setHotels([]);
        setMenus([]);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);

        const response = await getLiveHotels({ page: 1, limit: 50, latitude: customerLocation?.latitude, longitude: customerLocation?.longitude, search: debouncedSearchTerm });
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

    void loadLiveHotels();
  }, [user?.role, customerLocation, debouncedSearchTerm]);

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

  const visibleItems = useMemo(() => {
    const allItems: DisplayMenuItem[] = menus.flatMap((menu) =>
      menu.items.map((item) => ({
        ...item,
        hotelId: menu.hotelId,
        hotelName: menu.hotelName,
        hotelImageKey: menu.hotelImageKey,
      }))
    );

    let filtered = allItems;

    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) =>
        item.itemName.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    const query = searchTerm.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter((item) =>
        [item.itemName, item.hotelName, item.unitType]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }

    return filtered;
  }, [menus, selectedCategory, searchTerm]);

  // Derive dynamic categories based on available food items
  const dynamicCategories = useMemo(() => {
    const allItems = menus.flatMap((menu) => menu.items);
    // Use item names as categories. Capitalize first letter.
    const uniqueNames = new Set(
      allItems.map((item) => {
        const name = item.itemName.trim();
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      })
    );
    return ["All", ...Array.from(uniqueNames)].slice(0, 15); // Limit to top 15 categories so it doesn't get overwhelming
  }, [menus]);

  const handleBecomeVendor = async () => {
    if (!user) {
      toast.error("Please log in to apply as a vendor");
      navigate(APP_ROUTES.PUBLIC.LOGIN);
      return;
    }

    try {
      const response = await checkVendorStatus();
      const statusData = response.data;
      if (!statusData || !statusData.hasApplication) {
        navigate(APP_ROUTES.VENDOR.REGISTER);
        return;
      }

      const { status } = statusData;
      if (status === "approved") {
        toast.success("Your vendor account is already active.");
        dispatch(updateUser({ role: "vendor" }));
        navigate(APP_ROUTES.VENDOR.DASHBOARD);
      } else if (status === "pending") {
        navigate(APP_ROUTES.VENDOR.PENDING);
      } else if (status === "rejected") {
        navigate(APP_ROUTES.VENDOR.REJECTED);
      } else {
        navigate(APP_ROUTES.VENDOR.REGISTER);
      }
    } catch (requestError) {
      console.error("Failed to check vendor status:", requestError);
      navigate(APP_ROUTES.VENDOR.REGISTER);
    }
  };



  const scrollToRestaurants = () => {
    document.getElementById("live-restaurants")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-brand-light text-brand-dark pb-16 relative overflow-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes liquidBlob1 {
          0%   { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(0deg) scale(1); }
          34%  { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; transform: rotate(120deg) scale(1.05); }
          67%  { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; transform: rotate(240deg) scale(0.95); }
          100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(360deg) scale(1); }
        }
        @keyframes liquidBlob2 {
          0%   { border-radius: 50% 50% 50% 70% / 50% 50% 70% 50%; transform: rotate(0deg) scale(1.1); }
          34%  { border-radius: 80% 20% 50% 50% / 50% 50% 30% 70%; transform: rotate(-120deg) scale(0.9); }
          67%  { border-radius: 40% 60% 30% 70% / 60% 30% 70% 40%; transform: rotate(-240deg) scale(1.05); }
          100% { border-radius: 50% 50% 50% 70% / 50% 50% 70% 50%; transform: rotate(-360deg) scale(1.1); }
        }
        @keyframes liquidBlob3 {
          0%   { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; transform: rotate(0deg) scale(1); }
          50%  { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; transform: rotate(180deg) scale(1.1); }
          100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; transform: rotate(360deg) scale(1); }
        }
        .blob-1 { animation: liquidBlob1 18s ease-in-out infinite; }
        .blob-2 { animation: liquidBlob2 22s ease-in-out infinite; }
        .blob-3 { animation: liquidBlob3 25s ease-in-out infinite; }
      `}} />
      
      {/* Fluid Wavy Background Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[45rem] h-[45rem] bg-brand-primary opacity-20 blob-1 pointer-events-none z-0 mix-blend-multiply"></div>
      <div className="absolute top-[20%] left-[-15%] w-[40rem] h-[40rem] bg-[#e8cda1] opacity-40 blob-2 pointer-events-none z-0 mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] right-[10%] w-[35rem] h-[35rem] bg-brand-primary opacity-15 blob-3 pointer-events-none z-0 mix-blend-multiply"></div>
      <div className="absolute top-[40%] right-[20%] w-[25rem] h-[25rem] bg-orange-400 opacity-10 blob-1 pointer-events-none z-0 mix-blend-multiply" style={{ animationDuration: '30s', animationDirection: 'reverse' }}></div>



      {/* 1. Full Screen Hero Section */}
      <section className="relative flex min-h-[calc(100vh-73px)] w-full items-center justify-center overflow-hidden px-5 py-20">


        {/* Hero Content */}
        <div className="relative z-10 mx-auto w-full max-w-[1400px]">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            
            {/* Left Text */}
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-4 py-1.5 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-primary"></span>
                </span>
                <span className="text-xs font-semibold tracking-wide text-brand-primary uppercase">
                  Fresh leftovers near you
                </span>
              </div>
              
              <h1 className="text-5xl font-display font-semibold tracking-tight text-brand-dark sm:text-6xl lg:text-7xl lg:leading-[1.1]">
                Hot food. <br/>
                <span className="text-brand-primary italic">
                  Half the price.
                </span>
              </h1>
              
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-dark/80 font-medium">
                Discover surplus food from top restaurants around you and rescue premium meals at heavily discounted prices. Join the movement to reduce food waste.
              </p>
              
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <button 
                  onClick={scrollToRestaurants} 
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-brand-primary px-8 py-4 font-semibold text-white shadow-lg shadow-brand-primary/20 transition-all hover:bg-brand-primary-hover focus:outline-none focus:ring-4 focus:ring-brand-primary/30 hover:-translate-y-0.5"
                >
                  <span>Browse Restaurants</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {user?.role === "vendor" ? (
                  <button
                    type="button"
                    onClick={() => navigate("/vendor/dashboard")}
                    className="rounded-full border-2 border-brand-primary/20 bg-transparent px-8 py-4 font-semibold text-brand-primary backdrop-blur-md transition hover:bg-brand-primary/5 hover:border-brand-primary/40"
                  >
                    Go to Vendor Dashboard
                  </button>
                ) : user?.role !== "admin" ? (
                  <button
                    type="button"
                    onClick={handleBecomeVendor}
                    className="rounded-full border-2 border-brand-primary/20 bg-transparent px-8 py-4 font-semibold text-brand-primary backdrop-blur-md transition hover:bg-brand-primary/5 hover:border-brand-primary/40"
                  >
                    Become a Vendor
                  </button>
                ) : null}
              </div>
            </div>

            {/* Right Side Image & Animation */}
            <div className="mt-12 flex justify-center lg:mt-0 lg:justify-end">
              <div className="relative animate-[float_6s_ease-in-out_infinite] w-full max-w-sm lg:max-w-md">
                {/* A glowing backdrop for the burger */}
                <div className="absolute inset-0 scale-75 rounded-full bg-brand-primary opacity-30 blur-2xl"></div>
                {/* Burger Image */}
                <img
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1999&auto=format&fit=crop"
                  alt="Delicious premium burger"
                  className="relative z-10 h-auto w-full drop-shadow-2xl rounded-full object-cover aspect-square border-[8px] border-white/50"
                />
                
                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-10 z-20 flex items-center gap-4 rounded-[2rem] border border-white/40 bg-white/80 p-3 pr-5 lg:p-4 lg:pr-6 shadow-2xl shadow-brand-primary/10 backdrop-blur-md">
                  <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-full bg-brand-primary text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 lg:h-6 lg:w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.999 2.999 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.999 2.999 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-display text-lg lg:text-xl font-bold text-brand-dark">{hotels.length}</p>
                    <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-wide text-gray-500">Live Restaurants</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Custom style for the float and flow animations */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
          }
          @keyframes flow-1 {
            0% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(25px, -35px) rotate(8deg); }
            66% { transform: translate(-15px, 20px) rotate(-4deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }
          @keyframes flow-2 {
            0% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(-30px, -25px) rotate(-10deg); }
            66% { transform: translate(20px, -10px) rotate(6deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }
          @keyframes flow-3 {
            0% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(35px, 35px) rotate(15deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }
        `}} />
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-[1400px] px-5 sm:px-8">
        
        {/* 2. Search & Categories Section */}
        <section className="relative z-20 -mt-10 rounded-3xl bg-white/80 backdrop-blur-md p-6 shadow-xl shadow-brand-primary/5 border border-brand-primary/10 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            
            <div className="flex-1">
              <h3 className="text-2xl font-display font-semibold text-brand-dark">What are you craving?</h3>
              <p className="mt-1 text-sm font-medium text-brand-dark/60">Search for restaurants, cuisines, or specific dishes.</p>
            </div>
            
            <div className="relative flex w-full md:w-[28rem] items-center gap-2">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search restaurants or food..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-brand-primary/10 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-brand-dark transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/30 focus:shadow-md placeholder:text-gray-400"
                />
              </div>
              <button 
                type="button" 
                className="hidden rounded-2xl bg-brand-primary px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-primary-hover sm:block shrink-0"
              >
                Search
              </button>
            </div>
          </div>
          
          <div className="mt-8 flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {dynamicCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`snap-start whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  selectedCategory === category || (selectedCategory === "All" && category === "All")
                    ? "bg-brand-primary text-white shadow-md shadow-brand-primary/30" 
                    : "bg-brand-primary/5 text-brand-primary hover:bg-brand-primary/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* 3. Live Restaurants Section */}
        <section id="live-restaurants" className="mt-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h3 className="text-3xl font-display font-bold tracking-tight text-brand-dark">Restaurants Near You</h3>
              <p className="mt-2 text-sm font-medium text-brand-dark/60">Currently live and accepting orders</p>
            </div>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600"></div>
              <p className="mt-4 text-sm font-medium text-gray-500">Discovering nearby restaurants...</p>
            </div>
          )}
          
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-sm">
              <p className="font-medium">{error}</p>
            </div>
          )}
          
          {!isLoading && !error && visibleHotels.length === 0 && (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">No restaurants live</h3>
              <p className="mt-2 text-gray-500">There are no restaurants matching your criteria right now. Check back later!</p>
            </div>
          )}

          <div className="flex snap-x snap-mandatory overflow-x-auto pb-8 sm:grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:overflow-visible sm:pb-0 scrollbar-hide">
            {visibleHotels.map((hotel) => (
              <article 
                key={hotel.hotelId} 
                onClick={() => navigate(`/customer/restaurants/${hotel.hotelId}/menu`)}
                className="group relative cursor-pointer flex flex-col overflow-hidden rounded-[2rem] bg-white border border-brand-primary/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-primary/10 snap-center shrink-0 w-[85vw] sm:w-auto"
              >
                
                {liveHotelIds.includes(hotel.hotelId) && (
                  <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-100 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                    </span>
                    LIVE NOW
                  </div>
                )}

                <div className="overflow-hidden h-48 w-full relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  <img 
                    src={getImageUrl(hotel.hotelImageKey)} 
                    onError={(event) => { event.currentTarget.src = fallbackRestaurantImage; }} 
                    alt={hotel.hotelName} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />

                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h4 className="text-xl font-display font-bold text-brand-dark transition-colors group-hover:text-brand-primary">{hotel.hotelName}</h4>
                  <div className="mt-1 flex items-center justify-between text-sm font-medium text-brand-dark/60">
                    <span className="line-clamp-1">{hotel.place}</span>
                    {hotel.distanceInMeters !== undefined && (
                      <span className="flex items-center gap-1 shrink-0 text-brand-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                          <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                        </svg>
                        {(hotel.distanceInMeters / 1000).toFixed(1)} km away
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4 flex flex-1 items-end justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pickup Window</p>
                      <p className="mt-0.5 text-sm font-medium text-gray-900">{formatTime(hotel.pickupWindow.startTime)} – {formatTime(hotel.pickupWindow.endTime)}</p>
                    </div>
                    <div className="flex h-10 items-center justify-center rounded-xl bg-orange-50 px-3 text-xs font-bold text-orange-600">
                      {hotel.availableItemCount} items left
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 4. Today's Menu Section */}
        <section id="today-menu" className="mt-20">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h3 className="text-3xl font-display font-bold tracking-tight text-brand-dark">Today&apos;s Menu Items</h3>
              <p className="mt-2 text-sm font-medium text-brand-dark/60">Grab these deals before they&apos;re gone</p>
            </div>
          </div>

          {!isLoading && visibleItems.length === 0 && (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <h3 className="text-lg font-bold text-gray-900">Nothing here</h3>
              <p className="mt-2 text-gray-500">No specific menu items match your search.</p>
            </div>
          )}

          <div className="flex snap-x snap-mandatory overflow-x-auto pb-8 sm:grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:overflow-visible sm:pb-0 scrollbar-hide">
            {visibleItems.map((item) => (
              <article key={`${item.hotelId}-${item.itemId}`} className="group flex flex-col overflow-hidden rounded-[2rem] bg-white border border-brand-primary/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-primary/10 snap-center shrink-0 w-[85vw] sm:w-auto">
                
                <div
                  onClick={() => navigate(`/customer/restaurants/${item.hotelId}/menu/${item.itemId}`)}
                  className="relative h-48 w-full cursor-pointer overflow-hidden"
                >
                  <img
                    src={item.itemImageUrl || getImageUrl(item.hotelImageKey)}
                    onError={(event) => { event.currentTarget.src = getImageUrl(item.hotelImageKey) }}
                    alt={item.itemName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  
                  {item.stockQuantity <= 5 && (
                    <span className="absolute left-3 top-3 rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur-md">
                      Only {item.stockQuantity} left
                    </span>
                  )}
                  
                  <div className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-2 py-1 text-xs font-bold text-gray-900 shadow-sm backdrop-blur-sm">
                    {item.unitType}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h4
                    onClick={() => navigate(`/customer/restaurants/${item.hotelId}/menu/${item.itemId}`)}
                    className="cursor-pointer text-xl font-display font-bold text-brand-dark transition-colors hover:text-brand-primary"
                  >
                    {item.itemName}
                  </h4>
                  <p className="mt-1 text-sm font-medium text-brand-dark/60">{item.hotelName}</p>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-brand-dark/40 line-through">₹{item.originalPrice}</p>
                      <p className="text-2xl font-display font-bold text-brand-primary">₹{item.discountedPrice}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddToCartFromHome(item)}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg shadow-brand-primary/30 transition-transform hover:scale-110 hover:bg-brand-primary-hover focus:outline-none focus:ring-4 focus:ring-brand-primary/30"
                      title="Add to cart"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}