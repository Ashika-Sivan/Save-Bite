import { useEffect, useState } from "react";
import { getMyOrders, type Order } from "../../services/order.service";

type TabType = "active" | "previous";

const MyOrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [activeTab, setActiveTab] = useState<TabType>("active");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true);
                const response = await getMyOrders();
                setOrders(response.data || []);
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to load orders";
                setErrorMessage(message);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchOrders();
    }, []);

    const activeOrders = orders.filter(
        (order) => order.orderStatus === "placed" || order.orderStatus === "pending_payment"
    );

    const previousOrders = orders.filter(
        (order) =>
            order.orderStatus === "collected" ||
            order.orderStatus === "expired" ||
            order.orderStatus === "cancelled"
    );

    const currentOrders = activeTab === "active" ? activeOrders : previousOrders;

    const formatDate = (dateString?: string): string => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        const timeStr = new Intl.DateTimeFormat("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(date);

        return isToday ? `Today, ${timeStr}` : `${date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${timeStr}`;
    };

    const formatPickupTime = (endTimeString?: string): string => {
        if (!endTimeString) return "";
        const date = new Date(endTimeString);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        const timeStr = new Intl.DateTimeFormat("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(date);

        return isToday ? `Today, ${timeStr}` : `${date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${timeStr}`;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "placed":
                return (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                        Ready for Pickup
                    </span>
                );
            case "pending_payment":
                return (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        Payment Pending
                    </span>
                );
            case "collected":
                return (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        Completed
                    </span>
                );
            case "expired":
                return (
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
                        Expired
                    </span>
                );
            case "cancelled":
                return (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                        Cancelled
                    </span>
                );
            default:
                return (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        {status}
                    </span>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-[#faf7ef]">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-700" />
                    <p className="mt-3 text-sm font-medium text-gray-500">Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="mx-auto max-w-4xl px-5 py-12">
                <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
                    <h2 className="text-lg font-bold text-red-700">Unable to load orders</h2>
                    <p className="mt-2 text-sm text-gray-600">{errorMessage}</p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-5 rounded-full bg-green-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#faf7ef] px-4 py-10 md:px-8">
            <div className="mx-auto max-w-4xl">
                {/* Header Title */}
                <h1 className="font-serif text-3xl font-bold text-gray-900">My orders</h1>
                <p className="mt-1 text-sm text-gray-500">Track active pickups and review past orders.</p>

                {/* Navigation Tabs */}
                <div className="mt-6 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab("active")}
                        className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                            activeTab === "active"
                                ? "bg-[#15803d] text-white shadow-sm"
                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Active ({activeOrders.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("previous")}
                        className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                            activeTab === "previous"
                                ? "bg-[#15803d] text-white shadow-sm"
                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Previous ({previousOrders.length})
                    </button>
                </div>

                {/* Orders List */}
                <div className="mt-8 space-y-6">
                    {currentOrders.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
                            <p className="font-medium text-gray-500">
                                {activeTab === "active" ? "No active orders right now." : "No previous orders found."}
                            </p>
                        </div>
                    ) : (
                        currentOrders.map((order) => {
                            const shortId = `ORD-${order.id.slice(-5).toUpperCase()}`;

                            return (
                                <div
                                    key={order.id}
                                    className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm transition hover:shadow-md"
                                >
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
                                        {/* Left Info Column */}
                                        <div className="md:col-span-8">
                                            {/* Status Badge + Order Meta */}
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                {getStatusBadge(order.orderStatus)}
                                                <span className="font-semibold text-gray-400">•</span>
                                                <span className="font-medium text-gray-600">{shortId}</span>
                                                <span className="font-semibold text-gray-400">•</span>
                                                <span>{formatDate(order.createdAt)}</span>
                                            </div>

                                            {/* Hotel Name & Pickup Time */}
                                            <div className="mt-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">🏪</span>
                                                    <h2 className="text-xl font-bold text-gray-900">
                                                        {order.hotelName || "Restaurant"}
                                                    </h2>
                                                    {order.pickupWindow?.endTime && (
                                                        <span className="text-xs text-gray-500">
                                                            🕒 Pickup by {formatPickupTime(order.pickupWindow.endTime)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Items List */}
                                            <div className="mt-4 space-y-2 text-sm text-gray-700">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between">
                                                        <div>
                                                            <span className="font-semibold text-gray-900">{item.quantity}x</span>{" "}
                                                            <span>{item.itemName}</span>{" "}
                                                            <span className="text-xs text-gray-400">· {item.unitType}</span>
                                                        </div>
                                                        <div className="font-medium text-gray-600">
                                                            ₹{item.subTotal.toFixed(2)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Total */}
                                            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-base">
                                                <span className="font-medium text-gray-600">Total</span>
                                                <span className="font-bold text-gray-900">
                                                    ₹{order.totalAmount.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right Side: Pickup Code Box */}
                                        <div className="flex justify-center md:col-span-4">
                                            <div className="w-full max-w-[220px] rounded-2xl border border-amber-100 bg-[#faf7f2] p-5 text-center shadow-inner">
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                                    PICKUP CODE
                                                </p>
                                                <p className="mt-2 font-serif text-2xl font-black tracking-widest text-gray-900">
                                                    {order.pickupCode ? `PKB-${order.pickupCode}` : "—"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyOrdersPage;
