import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { Menu, X, MapPin, User, LogOut, ChevronDown, Home, ShoppingBag, LayoutDashboard, Wallet } from "lucide-react";

import type { AppDispatch, RootState } from "../../redux/store";
import { clearCredentials } from "../../redux/authSlice";
import { clearCart } from "../../redux/cartSlice";
import { logout } from "../../services/auth.service";
import { reverseGeoCode } from "../../services/location.service";
import BellNotification from "./BellNotification";

interface CustomerLocation {
  latitude: number;
  longitude: number;
  placeName?: string;
}

const CustomerHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);

  const [customerLocation, setCustomerLocation] = useState<CustomerLocation | null>(() => {
    const savedLocation = localStorage.getItem("customerLocation");
    return savedLocation ? JSON.parse(savedLocation) : null;
  });

  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

 
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const [watchId, setWatchId] = useState<number | null>(null);
  const lastGeocodeRef = useRef<{lat: number, lon: number, time: number} | null>(null);

  const startTracking = (): void => {
    if (!navigator.geolocation) {
      toast.error("Location is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const now = Date.now();

        // Get saved placeName or start without one
        const currentLocStr = localStorage.getItem("customerLocation");
        const currentLoc = currentLocStr ? JSON.parse(currentLocStr) : null;

        const loc: CustomerLocation = {
          latitude: lat,
          longitude: lon,
          placeName: currentLoc?.placeName,
        };

        const lastGeo = lastGeocodeRef.current;
        const needsGeocode = !loc.placeName || 
          (lastGeo && (Math.abs(lastGeo.lat - lat) > 0.002 || Math.abs(lastGeo.lon - lon) > 0.002) && (now - lastGeo.time > 10000));

        if (needsGeocode) {
           try {
              const res = await reverseGeoCode(lat, lon);
              const shortName = res.address?.neighbourhood || res.address?.suburb || res.address?.village || res.address?.town || res.address?.city || res.display_name.split(',')[0];
              loc.placeName = shortName;
              lastGeocodeRef.current = { lat, lon, time: now };
           } catch(e) {
              console.error("Geocoding failed", e);
           }
        }

        setCustomerLocation(loc);
        localStorage.setItem("customerLocation", JSON.stringify(loc));
        setIsGettingLocation(false);

        // Only show toast on first successful fetch
        if (!watchId && !lastGeo) {
            toast.success("Live location tracking started");
        }
      },
      (locationError) => {
        console.error("Unable to get location:", locationError);
        setIsGettingLocation(false);
        toast.error("Please allow location access");
        stopTracking();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
    
    setWatchId(id);
    setIsMobileMenuOpen(false);
  };

  const stopTracking = (): void => {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
    }
    setCustomerLocation(null);
    localStorage.removeItem("customerLocation");
    lastGeocodeRef.current = null;
    toast.success("Live location tracking stopped");
  };

  useEffect(() => {
    return () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
        }
    };
  }, [watchId]);

  const handleLogout = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-900">
            Are you sure you want to logout?
          </p>
          <div className="flex gap-2 justify-end">
            <button
              className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
            <button
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await logout();
                  dispatch(clearCredentials());
                  dispatch(clearCart());
                  localStorage.removeItem("customerLocation");
                  setIsMenuOpen(false);
                  setIsMobileMenuOpen(false);
                  toast.success("Logged out successfully");
                  navigate("/", { replace: true });
                } catch (error) {
                  console.error("Logout failed:", error);
                  toast.error("Logout failed. Please try again.");
                }
              }}
            >
              Logout
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleNavClick = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wave-flow {
          0% { transform: translateY(40px) scale(0.95); opacity: 0; }
          60% { transform: translateY(-5px) scale(1.02); opacity: 1; }
          100% { transform: translateY(0px) scale(1); opacity: 1; }
        }
        .animate-wave-flow {
          opacity: 0;
          animation: wave-flow 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}} />
      <header 
        className={`fixed top-0 z-50 w-full transition-all duration-500 ease-in-out ${
          scrolled 
            ? "py-4 px-4 border-none shadow-none" 
            : "py-0 px-0 bg-[#faf7ef] border-none shadow-none"
        }`}
      >
        <div className={`mx-auto flex items-center justify-between gap-5 transition-all duration-500 ease-in-out ${
          scrolled
            ? "max-w-5xl rounded-full bg-white/80 backdrop-blur-xl shadow-sm border-none px-6 py-3"
            : "max-w-[1400px] px-5 py-4"
        }`}>
          
          {/* Logo */}
          <button
            type="button"
            onClick={() => handleNavClick("/")}
            className="flex items-center gap-2"
          >
            <div className="flex h-10 w-10 overflow-hidden items-center justify-center rounded-full bg-brand-primary shadow-sm">
              <img src="/logo.png" alt="SaveBite Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-brand-dark">
              SaveBite
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <button
              type="button"
              onClick={() => handleNavClick("/")}
              className={`group relative text-sm font-semibold transition-all duration-300 ${
                isActive("/") ? "text-brand-primary" : "text-brand-dark/70 hover:text-brand-primary hover:-translate-y-0.5"
              }`}
            >
              Home
              <span className={`absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-brand-primary transition-transform duration-300 ease-out group-hover:scale-x-100 ${isActive("/") ? "scale-x-100" : ""}`}></span>
            </button>
            
            <div className="flex flex-col items-end">
              <button
                type="button"
                onClick={watchId ? stopTracking : startTracking}
                disabled={isGettingLocation}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
                  watchId 
                    ? "border-green-500/20 bg-green-500/5 text-green-600 hover:bg-green-500/10" 
                    : "border-brand-primary/20 bg-brand-primary/5 text-brand-primary hover:bg-brand-primary/10"
                }`}
              >
                <MapPin size={16} />
                {isGettingLocation 
                  ? "Tracking..." 
                  : watchId && customerLocation?.placeName 
                    ? customerLocation.placeName 
                    : watchId 
                      ? "Location On" 
                      : "Live Location"}
              </button>
            </div>

            {user && (
              <>
                <button
                  type="button"
                  onClick={() => handleNavClick("/orders")}
                  className={`group relative text-sm font-semibold transition-all duration-300 ${
                    isActive("/orders") ? "text-brand-primary" : "text-brand-dark/70 hover:text-brand-primary hover:-translate-y-0.5"
                  }`}
                >
                  Orders
                  <span className={`absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-brand-primary transition-transform duration-300 ease-out group-hover:scale-x-100 ${isActive("/orders") ? "scale-x-100" : ""}`}></span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick("/cart")}
                  className={`group relative flex items-center gap-1.5 text-sm font-semibold transition-all duration-300 ${
                    isActive("/cart") ? "text-brand-primary" : "text-brand-dark/70 hover:text-brand-primary hover:-translate-y-0.5"
                  }`}
                >
                  Cart
                  <span className={`absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-brand-primary transition-transform duration-300 ease-out group-hover:scale-x-100 ${isActive("/cart") ? "scale-x-100" : ""}`}></span>
                  {cartQuantity > 0 && (
                    <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                      {cartQuantity}
                    </span>
                  )}
                </button>

                <div className="mx-2 h-6 w-px bg-brand-primary/10"></div>
                
                <BellNotification />
              </>
            )}

            {!user ? (
              <div className="flex items-center gap-4 ml-2">
                <button
                  type="button"
                  onClick={() => handleNavClick("/login")}
                  className="group relative text-sm font-bold text-brand-primary transition-all hover:text-brand-primary-hover hover:-translate-y-0.5"
                >
                  Log In
                  <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-brand-primary transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick("/signup")}
                  className="rounded-full bg-brand-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-primary/20 transition-all hover:-translate-y-0.5 hover:bg-brand-primary-hover hover:shadow-brand-primary/30"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-brand-primary/10 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition-colors hover:bg-brand-light"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-bold text-brand-dark max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown size={14} className="text-brand-dark/50" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-brand-primary/10 bg-white shadow-xl shadow-brand-primary/5">
                    <div className="border-b border-brand-primary/5 px-4 py-3">
                      <p className="truncate text-sm font-bold text-brand-dark">{user.name}</p>
                      <p className="truncate text-xs font-medium text-brand-dark/50">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        type="button"
                        onClick={() => { setIsMenuOpen(false); handleNavClick("/profile"); }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-dark transition hover:bg-brand-light hover:text-brand-primary"
                      >
                        <User size={16} /> My Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsMenuOpen(false); handleNavClick("/wallet"); }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-dark transition hover:bg-brand-light hover:text-brand-primary"
                      >
                        <Wallet size={16} /> My Wallet
                      </button>
                      {user.role === "vendor" && (
                        <button
                          type="button"
                          onClick={() => { setIsMenuOpen(false); handleNavClick("/vendor/dashboard"); }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-dark transition hover:bg-brand-light hover:text-brand-primary"
                        >
                          <LayoutDashboard size={16} /> Vendor Dashboard
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Mobile controls */}
          <div className="flex items-center gap-3 md:hidden">
            {user && (
              <div className="relative">
                <button
                  onClick={() => handleNavClick("/cart")}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-dark shadow-sm border border-brand-primary/10"
                >
                  <ShoppingBag size={20} />
                  {cartQuantity > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                      {cartQuantity}
                    </span>
                  )}
                </button>
              </div>
            )}
            
            {user && <BellNotification />}
            
            <button 
              type="button" 
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-dark shadow-sm border border-brand-primary/10 transition-colors hover:bg-brand-light"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-brand-primary/10 backdrop-blur-xl transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Slide-out Panel */}
          <div className="absolute right-0 top-0 flex h-full w-full flex-col bg-transparent transition-transform">
            <div className="flex items-center justify-between px-5 py-6">
              <span className="font-display text-2xl font-bold text-white drop-shadow-md">Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white shadow-lg backdrop-blur-md hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-6 hide-scrollbar space-y-4">
              {/* User Section (Mobile) */}
              {user ? (
                <div 
                  className="flex items-center gap-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 shadow-lg mb-4 animate-wave-flow" 
                  style={{ animationDelay: '0.1s' }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-lg font-bold text-white uppercase shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="truncate text-base font-bold text-white">{user.name}</p>
                    <p className="truncate text-xs font-medium text-white/70">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => handleNavClick("/login")}
                    className="rounded-2xl border border-white/30 bg-white/10 backdrop-blur-md py-3.5 text-center text-sm font-bold text-white shadow-lg transition hover:bg-white/20 animate-wave-flow"
                    style={{ animationDelay: '0.1s' }}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => handleNavClick("/signup")}
                    className="rounded-2xl border border-brand-primary/50 bg-brand-primary/90 backdrop-blur-md py-3.5 text-center text-sm font-bold text-white shadow-lg transition hover:bg-brand-primary animate-wave-flow"
                    style={{ animationDelay: '0.2s' }}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="space-y-3">
                <button
                  onClick={() => handleNavClick("/")}
                  className={`flex w-full items-center gap-3 rounded-2xl border backdrop-blur-md px-4 py-4 text-left text-sm font-bold shadow-lg transition-all animate-wave-flow ${
                    isActive("/") ? "border-brand-primary bg-brand-primary text-white" : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  }`}
                  style={{ animationDelay: '0.25s' }}
                >
                  <Home size={20} /> Home
                </button>

                {user && (
                  <button
                    onClick={() => handleNavClick("/orders")}
                    className={`flex w-full items-center gap-3 rounded-2xl border backdrop-blur-md px-4 py-4 text-left text-sm font-bold shadow-lg transition-all animate-wave-flow ${
                      isActive("/orders") ? "border-brand-primary bg-brand-primary text-white" : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                    }`}
                    style={{ animationDelay: '0.35s' }}
                  >
                    <ShoppingBag size={20} /> My Orders
                  </button>
                )}
                
                {user && user.role === "vendor" && (
                  <button
                    onClick={() => handleNavClick("/vendor/dashboard")}
                    className="flex w-full items-center gap-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-4 py-4 text-left text-sm font-bold text-white shadow-lg transition-all hover:bg-white/20 animate-wave-flow"
                    style={{ animationDelay: '0.45s' }}
                  >
                    <LayoutDashboard size={20} /> Vendor Dashboard
                  </button>
                )}
              </nav>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <div>
                  <button
                    onClick={watchId ? stopTracking : startTracking}
                    disabled={isGettingLocation}
                    className={`flex w-full items-center gap-3 rounded-2xl border backdrop-blur-md px-4 py-4 text-left text-sm font-bold shadow-lg transition-all disabled:opacity-50 animate-wave-flow ${
                      watchId 
                        ? "border-green-500/40 bg-green-500/20 text-white hover:bg-green-500/30" 
                        : "border-brand-primary/40 bg-brand-primary/20 text-white hover:bg-brand-primary/30"
                    }`}
                    style={{ animationDelay: '0.55s' }}
                  >
                    <MapPin size={20} />
                    {isGettingLocation 
                      ? "Tracking..." 
                      : watchId && customerLocation?.placeName 
                        ? `Live: ${customerLocation.placeName}` 
                        : watchId 
                          ? "Stop Live Tracking" 
                          : "Start Live Location"}
                  </button>
                </div>

                {user && (
                  <button
                    onClick={() => handleNavClick("/profile")}
                    className="flex w-full items-center gap-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-4 py-4 text-left text-sm font-bold text-white shadow-lg transition-all hover:bg-white/20 animate-wave-flow"
                    style={{ animationDelay: '0.65s' }}
                  >
                    <User size={20} /> Profile Settings
                  </button>
                )}
              </div>
            </div>

            {/* Logout floating button */}
            {user && (
              <div className="p-5 pb-8 pt-0 mt-auto animate-wave-flow" style={{ animationDelay: '0.75s' }}>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-300 bg-red-100/90 backdrop-blur-sm py-4 text-sm font-bold text-red-600 shadow-md transition-all hover:bg-red-200"
                >
                  <LogOut size={20} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerHeader;