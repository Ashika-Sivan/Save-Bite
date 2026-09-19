import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { addToCart, replaceCart, type AddToCartPayload } from "../../redux/cartSlice";
import { getLiveHotelMenu, type LiveHotelMenu, type LiveMenuItem } from "../../services/customerBrowse.service";

const fallbackRestaurantImage = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000";

const getImageUrl = (imageKey: string): string => {
    if (/^https?:\/\//i.test(imageKey)) {
        return imageKey;
    }
    const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;
    return imageBaseUrl ? `${imageBaseUrl.replace(/\/$/, "")}/${imageKey}` : fallbackRestaurantImage;
};

const formatTime = (value: string): string => {
    return new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(value));
};

const FoodDetails = () => {
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch<AppDispatch>();
    const { hotelId, itemId } = useParams<{ hotelId: string; itemId: string }>();

    const cartHotelId = useSelector((state: RootState) => state.cart.hotelId);

    const [menu, setMenu] = useState<LiveHotelMenu | null>(null);
    const [foodItem, setFoodItem] = useState<LiveMenuItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchFoodDetails = async () => {
            if (!hotelId || !itemId) {
                setError("Invalid URL parameters");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const response = await getLiveHotelMenu(hotelId);
                const fetchedMenu = response.data;
                setMenu(fetchedMenu);

                const item = fetchedMenu.items.find(i => i.itemId === itemId);
                if (item) {
                    setFoodItem(item);
                } else {
                    setError("Food item not found or no longer available.");
                }
            } catch (err) {
                console.error("Failed to fetch food details:", err);
                setError("Could not load food details.");
            } finally {
                setIsLoading(false);
            }
        };

        void fetchFoodDetails();
    }, [hotelId, itemId]);

    const increaseQuantity = (availableStock: number) => {
        if (quantity < availableStock) {
            setQuantity(prev => prev + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = () => {
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
        if (!menu || !foodItem) return;

        const payload: AddToCartPayload = {
            hotelId: menu.hotelId,
            menuId: menu.menuId,
            hotelName: menu.hotelName,
            pickupWindow: {
                startTime: menu.pickupWindow.startTime,
                endTime: menu.pickupWindow.endTime,
            },
            itemId: foodItem.itemId,
            itemName: foodItem.itemName,
            unitType: foodItem.unitType,
            originalPrice: foodItem.originalPrice,
            discountedPrice: foodItem.discountedPrice,
            availableStock: foodItem.stockQuantity,
            quantity: quantity,
            hotelImageKey: menu.hotelImageKey,
            itemImageUrl: foodItem.itemImageUrl,
        };

        if (cartHotelId && cartHotelId !== menu.hotelId) {
            toast.custom(
                (currentToast) => (
                    <div className="w-full max-w-sm rounded-[2rem] border border-gray-200 bg-white p-5 shadow-lg">
                        <h3 className="font-display font-semibold text-gray-900">
                            Replace current cart?
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Your cart contains food from another restaurant. Clear it and add food from {menu.hotelName}?
                        </p>
                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => toast.dismiss(currentToast.id)}
                                className="rounded-full border border-gray-300 px-4 py-2 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    dispatch(replaceCart(payload));
                                    toast.dismiss(currentToast.id);
                                    toast.success("Cart replaced successfully");
                                }}
                                className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
                            >
                                Replace cart
                            </button>
                        </div>
                    </div>
                ),
                { duration: Infinity, position: "top-center" }
            );
            return;
        }

        dispatch(addToCart(payload));
        toast.success(`${foodItem.itemName} added to cart`);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-brand-light">
                <p className="text-brand-primary animate-pulse">Loading amazing food...</p>
            </div>
        );
    }

    if (error || !menu || !foodItem) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-light px-5">
                <p className="text-center text-red-600 font-medium">{error ?? "Item not found"}</p>
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="rounded-full bg-brand-primary px-6 py-2 text-white transition hover:bg-brand-primary/90"
                >
                    Return home
                </button>
            </div>
        );
    }

    const pickupEndTime = new Date(menu.pickupWindow.endTime);
    const orderCutoffTime = new Date(pickupEndTime.getTime() - 30 * 60 * 1000);

    return (
        <div className="min-h-screen bg-brand-light px-4 py-6 md:py-10">
            <div className="mx-auto max-w-5xl">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mb-8 text-sm font-medium text-brand-primary hover:underline flex items-center gap-2"
                >
                    <span>←</span> Back to selection
                </button>

                <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
                    {/* Food Image & Details */}
                    <div className="flex flex-col gap-6">
                        <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-brand-primary/5">
                            {foodItem.itemImageUrl ? (
                                <img
                                    src={foodItem.itemImageUrl}
                                    alt={foodItem.itemName}
                                    className="h-80 w-full object-cover sm:h-96"
                                />
                            ) : (
                                <div className="flex h-80 w-full items-center justify-center bg-brand-light/50 text-5xl">
                                    🍽️
                                </div>
                            )}
                            
                            <div className="p-6 md:p-8">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <h1 className="font-display text-3xl font-bold text-brand-dark capitalize">
                                            {foodItem.itemName}
                                        </h1>
                                        <p className="mt-2 text-gray-500 capitalize">{foodItem.unitType}</p>
                                    </div>
                                    {foodItem.stockQuantity <= 5 && (
                                        <span className="shrink-0 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                                            Only {foodItem.stockQuantity} left!
                                        </span>
                                    )}
                                </div>

                                <div className="mt-6 flex items-center gap-4">
                                    <span className="text-4xl font-bold text-brand-primary">
                                        ₹{foodItem.discountedPrice}
                                    </span>
                                    <span className="text-xl text-gray-400 line-through decoration-1">
                                        ₹{foodItem.originalPrice}
                                    </span>
                                </div>

                                <div className="mt-10 border-t border-brand-primary/10 pt-8">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center rounded-full bg-brand-light p-1">
                                            <button
                                                type="button"
                                                onClick={decreaseQuantity}
                                                disabled={quantity <= 1}
                                                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm transition disabled:opacity-50"
                                            >
                                                −
                                            </button>
                                            <span className="w-16 text-center font-bold text-brand-dark">
                                                {quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => increaseQuantity(foodItem.stockQuantity)}
                                                disabled={quantity >= foodItem.stockQuantity}
                                                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm transition disabled:opacity-50"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleAddToCart}
                                            disabled={!foodItem.isAvailable || foodItem.stockQuantity === 0}
                                            className="flex-1 rounded-full bg-brand-primary px-8 py-4 font-bold text-white shadow-lg shadow-brand-primary/20 transition hover:-translate-y-1 hover:shadow-brand-primary/30 disabled:opacity-50 disabled:hover:translate-y-0"
                                        >
                                            Add to Cart • ₹{foodItem.discountedPrice * quantity}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vendor Information Sidebar */}
                    <div className="flex flex-col gap-6">
                        <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-brand-primary/5 md:p-8">
                            <h2 className="font-display text-xl font-bold text-brand-dark mb-6">Prepared By</h2>
                            
                            <div className="flex items-center gap-4">
                                <img
                                    src={getImageUrl(menu.hotelImageKey)}
                                    alt={menu.hotelName}
                                    className="h-16 w-16 rounded-full object-cover border-2 border-brand-light"
                                />
                                <div>
                                    <h3 className="font-bold text-brand-dark">{menu.hotelName}</h3>
                                    <p className="text-sm text-gray-500">{menu.businessType}</p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4 rounded-2xl bg-brand-light/50 p-5">
                                <div className="flex gap-3">
                                    <span className="text-brand-primary">📍</span>
                                    <p className="text-sm text-gray-600">
                                        <span className="block font-semibold text-brand-dark">{menu.place}</span>
                                        {menu.address}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <span className="text-brand-primary">⏰</span>
                                    <p className="text-sm text-gray-600">
                                        <span className="block font-semibold text-brand-dark">Pickup Window</span>
                                        After payment, before {formatTime(menu.pickupWindow.endTime)}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <span className="text-brand-primary">⏳</span>
                                    <p className="text-sm text-gray-600">
                                        <span className="block font-semibold text-brand-dark">Order Cutoff</span>
                                        {formatTime(orderCutoffTime.toISOString())}
                                    </p>
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate(`/customer/restaurants/${menu.hotelId}/menu`)}
                                className="mt-6 w-full rounded-full border-2 border-brand-primary/10 py-3 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/5"
                            >
                                View Full Menu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodDetails;
