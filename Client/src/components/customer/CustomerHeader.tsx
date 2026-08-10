import { useState } from "react";
import {
    useDispatch,
    useSelector,
} from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import type {
    AppDispatch,
    RootState,
} from "../../redux/store";

import {
    clearCredentials,
} from "../../redux/authSlice";

import {
    clearCart,
} from "../../redux/cartSlice";

import {
    logout,
} from "../../services/auth.service";
interface CustomerLocation {
    latitude: number;
    longitude: number;
}

const CustomerHeader = () => {
    const navigate = useNavigate();

    const dispatch =
        useDispatch<AppDispatch>();

    const [isMenuOpen, setIsMenuOpen] =
        useState(false);

    const user = useSelector(
        (state: RootState) =>
            state.auth.user
    );

    const cartItems = useSelector(
        (state: RootState) =>
            state.cart.items
    );

    const cartQuantity = cartItems.reduce(
        (total, item) =>
            total + item.quantity,
        0
    );

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

    const handleLogout = async (): Promise<void> => {
        try {
            await logout();

            dispatch(clearCredentials());
            dispatch(clearCart());

            localStorage.removeItem(
                "customerLocation"
            );

            setIsMenuOpen(false);

            toast.success(
                "Logged out successfully"
            );

            navigate("/", {
                replace: true,
            });
        } catch (error) {
            console.error(
                "Logout failed:",
                error
            );

            toast.error(
                "Logout failed. Please try again."
            );
        }
    };

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-[#faf7ef]/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4">
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="text-xl font-bold text-green-800"
                >
                    SaveBite
                </button>

                <nav className="flex items-center gap-5 text-sm">
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/")
                        }
                        className="transition hover:text-green-700"
                    >
                        Home
                    </button>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={isGettingLocation}
                      className="rounded-full border border-green-700 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50 disabled:opacity-50"
                  >
                      {isGettingLocation
                          ? "Getting location..."
                          : customerLocation
                            ? "Location enabled"
                            : "Use my location"}
                      </button>

                    {user && (
                        <>
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/orders"
                                    )
                                }
                                className="transition hover:text-green-700"
                            >
                                Orders
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/cart")
                                }
                                className="relative transition hover:text-green-700"
                            >
                                Cart

                                {cartQuantity > 0 && (
                                    <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-bold text-white">
                                        {cartQuantity}
                                    </span>
                                )}
                            </button>
                        </>
                    )}

                    {!user ? (
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/login"
                                    )
                                }
                                className="font-medium text-green-700 hover:underline"
                            >
                                Login
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/signup"
                                    )
                                }
                                className="rounded-full bg-green-700 px-4 py-2 font-semibold text-white transition hover:bg-green-800"
                            >
                                Sign Up
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setIsMenuOpen(
                                        (current) =>
                                            !current
                                    )
                                }
                                className="flex items-center gap-1 font-semibold text-green-800"
                            >
                                {user.name}
                                <span>▾</span>
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 mt-3 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                                    <button
                                        type="button"
                                        onClick={
                                            handleLogout
                                        }
                                        className="w-full px-4 py-3 text-left text-sm transition hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default CustomerHeader;