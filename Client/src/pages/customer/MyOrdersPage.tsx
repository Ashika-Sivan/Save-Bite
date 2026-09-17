import { useEffect, useState } from "react";
import { getMyOrders, cancelOrder, type Order } from "../../services/order.service";
import { raiseOrderConcern } from "../../services/concern.service";
import { submitReview } from "../../services/review.service";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
import { ShoppingBag, Store, Clock, MapPin, AlertTriangle, Star, X, XCircle, CheckCircle, Info, Ticket } from "lucide-react";
import Pagination from "../../components/common/Pagination";

interface ErrorResponse {
    message?: string;
}

type TabType = "active" | "previous";

const MyOrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [activeTab, setActiveTab] = useState<TabType>("active");


    const [selectedOrderForConcern, setSelectedOrderForConcern] = useState<Order | null>(null);
    const [concernReason, setConcernReason] = useState("");
    const [concernPhoto, setConcernPhoto] = useState<File | null>(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const [isSubmittingConcern, setIsSubmittingConcern] = useState(false);


    const [page, setPage] = useState(1);
    const limit = 5;


    const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);
    const [reviewRating, setReviewRating] = useState<number>(5);
    const [reviewComment, setReviewComment] = useState<string>("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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

    useEffect(() => {
        const loadOrders = async () => {
            await fetchOrders();
        };
        loadOrders();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [activeTab]);

    const activeOrders = orders.filter(
        (order) =>
            order.orderStatus === "placed" ||
            order.orderStatus === "pending_payment" ||
            order.orderStatus === "concern_raised"
    );

    const previousOrders = orders.filter(
        (order) =>
            order.orderStatus === "collected" ||
            order.orderStatus === "expired" ||
            order.orderStatus === "cancelled" ||
            order.orderStatus === "resolved"
    );

    const currentOrders = activeTab === "active" ? activeOrders : previousOrders;

    const formatDate = (dateString?: string): string => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        const timeStr = new Intl.DateTimeFormat("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(date);

        return isToday ? `Today, ${timeStr}` : `${date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" })}, ${timeStr}`;
    };

    const formatPickupTime = (endTimeString?: string): string => {
        if (!endTimeString) return "";
        const date = new Date(endTimeString);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        const timeStr = new Intl.DateTimeFormat("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(date);

        return isToday ? `Today, ${timeStr}` : `${date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" })}, ${timeStr}`;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "placed":
                return (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-600 backdrop-blur-sm">
                        <CheckCircle size={14} /> Ready for Pickup
                    </span>
                );
            case "concern_raised":
                return (
                    <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-600 backdrop-blur-sm">
                        <Clock size={14} /> Concern Under Review
                    </span>
                );
            case "resolved":
                return (
                    <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 text-xs font-bold text-green-600 backdrop-blur-sm">
                        <CheckCircle size={14} /> Resolved (Refunded)
                    </span>
                );
            case "pending_payment":
                return (
                    <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-600 backdrop-blur-sm">
                        <Clock size={14} /> Payment Pending
                    </span>
                );
            case "collected":
                return (
                    <span className="flex items-center gap-1.5 rounded-full bg-gray-500/10 border border-gray-500/20 px-3 py-1 text-xs font-bold text-gray-600 backdrop-blur-sm">
                        <CheckCircle size={14} /> Completed
                    </span>
                );
            case "expired":
                return (
                    <span className="flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-xs font-bold text-rose-600 backdrop-blur-sm">
                        <X size={14} /> Expired
                    </span>
                );
            case "cancelled":
                return (
                    <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-bold text-red-600 backdrop-blur-sm">
                        <X size={14} /> Cancelled
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1.5 rounded-full bg-gray-500/10 border border-gray-500/20 px-3 py-1 text-xs font-bold text-gray-600 backdrop-blur-sm">
                        <Info size={14} /> {status}
                    </span>
                );
        }
    };

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setConcernPhoto(file);
            setPhotoPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRaiseConcernSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrderForConcern) return;
        if (!concernReason.trim()) {
            toast.error("Please describe your concern");
            return;
        }
        if (!concernPhoto) {
            toast.error("Please upload a photo evidence");
            return;
        }

        try {
            setIsSubmittingConcern(true);
            await raiseOrderConcern(selectedOrderForConcern.id, concernReason, concernPhoto);
            toast.success("Concern submitted successfully! Admins will review the EXIF timestamp & evidence.");
            setSelectedOrderForConcern(null);
            setConcernReason("");
            setConcernPhoto(null);
            setPhotoPreviewUrl(null);
            await fetchOrders();
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const msg = axiosError.response?.data?.message || "Failed to submit concern";
            toast.error(msg);
        } finally {
            setIsSubmittingConcern(false);
        }
    };

    const handleCancelOrder = (orderId: string) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <div className="flex items-center gap-2 font-semibold text-gray-800">
                    <AlertTriangle className="text-amber-500" size={20} />
                    <span>Cancel Order?</span>
                </div>
                <p className="text-sm text-gray-600">Are you sure you want to cancel this order? This action cannot be undone.</p>
                <div className="flex justify-end gap-2 mt-2">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                        Keep Order
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                setIsLoading(true);
                                await cancelOrder(orderId);
                                toast.success("Order cancelled successfully");
                                setActiveTab("previous");
                                await fetchOrders();
                            } catch (err: any) {
                                toast.error(err.response?.data?.message || "Failed to cancel order");
                            } finally {
                                setIsLoading(false);
                            }
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition"
                    >
                        Yes, Cancel
                    </button>
                </div>
            </div>
        ), {
            duration: 8000,
            position: 'top-center',
        });
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrderForReview) return;
        if (!reviewComment.trim()) {
            toast.error("Please enter a review comment");
            return;
        }

        try {
            setIsSubmittingReview(true);
            await submitReview({
                orderId: selectedOrderForReview.id,
                hotelId: selectedOrderForReview.hotelId,
                rating: reviewRating,
                comment: reviewComment.trim(),
            });
            toast.success("Thank you for reviewing! Your review is now published.");
            setSelectedOrderForReview(null);
            setReviewComment("");
            setReviewRating(5);
            await fetchOrders();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to submit review");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-[#faf7ef]">
                <LoadingSpinner message="Loading your orders..." />
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
        <div className="min-h-screen bg-brand-light text-brand-dark pb-16 relative overflow-hidden">
            <style dangerouslySetInnerHTML={{
                __html: `
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
                .blob-1 { animation: liquidBlob1 18s ease-in-out infinite; }
                .blob-2 { animation: liquidBlob2 22s ease-in-out infinite; }
            `}} />

            {/* Fluid Wavy Background Blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[45rem] h-[45rem] bg-brand-primary opacity-20 blob-1 pointer-events-none z-0 mix-blend-multiply"></div>
            <div className="absolute top-[20%] left-[-15%] w-[40rem] h-[40rem] bg-[#e8cda1] opacity-40 blob-2 pointer-events-none z-0 mix-blend-multiply"></div>

            <div className="relative z-10 mx-auto max-w-4xl px-4 pt-28 pb-10 md:px-8 md:pt-32">

                <h1 className="font-display text-4xl font-bold text-brand-dark drop-shadow-sm">My Orders</h1>
                <p className="mt-2 text-sm text-brand-dark/70 font-medium">Track active pickups, review past orders, or raise concerns.</p>

                <div className="mt-8 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab("active")}
                        className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all backdrop-blur-md shadow-sm ${activeTab === "active"
                                ? "bg-brand-primary text-white border border-brand-primary/20"
                                : "border border-brand-primary/20 bg-white/40 text-brand-dark hover:bg-white/60"
                            }`}
                    >
                        Active ({activeOrders.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("previous")}
                        className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all backdrop-blur-md shadow-sm ${activeTab === "previous"
                                ? "bg-brand-primary text-white border border-brand-primary/20"
                                : "border border-brand-primary/20 bg-white/40 text-brand-dark hover:bg-white/60"
                            }`}
                    >
                        Previous ({previousOrders.length})
                    </button>
                </div>


                <div className="mt-8 space-y-6">
                    {currentOrders.length === 0 ? (
                        <EmptyState
                            icon={<ShoppingBag className="h-10 w-10" />}
                            title={activeTab === "active" ? "No active orders" : "No previous orders"}
                            description={activeTab === "active"
                                ? "You don't have any active food pickups. Start exploring nearby surplus food!"
                                : "You haven't completed any orders yet."}
                        />
                    ) : (
                        <>
                            {currentOrders.slice((page - 1) * limit, page * limit).map((order) => {
                                const shortId = `ORD-${order.id.slice(-5).toUpperCase()}`;
                                const isEligibleForConcern = order.orderStatus === "placed";
                                
                                // Check if order is eligible for cancellation (within 5 minutes of creation)
                                const isEligibleForCancel = order.orderStatus === "placed" && 
                                    order.createdAt && 
                                    (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60) <= 5;

                                return (
                                    <div
                                        key={order.id}
                                        className="overflow-hidden rounded-3xl border border-white/50 bg-white/60 backdrop-blur-md p-6 shadow-sm transition hover:shadow-md hover:bg-white/70"
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
                                                        <Store className="text-brand-primary" size={24} strokeWidth={2.5} />
                                                        <h2 className="text-xl font-bold text-gray-900">
                                                            {order.hotelName || "Restaurant"}
                                                        </h2>
                                                        {order.pickupWindow?.endTime && (
                                                            <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 ml-2">
                                                                <Clock size={14} /> Pickup by {formatPickupTime(order.pickupWindow.endTime)}
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

                                                {/* Total & Raise Concern Action */}
                                                <div className="mt-4 flex flex-wrap items-center justify-between border-t border-gray-100 pt-3 text-base">
                                                    <div>
                                                        <span className="font-medium text-gray-600">Total: </span>
                                                        <span className="font-bold text-gray-900">
                                                            ₹{order.totalAmount.toFixed(2)}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {order.vendorLocation && (
                                                            <a
                                                                href={`https://www.google.com/maps/search/?api=1&query=${order.vendorLocation.lat},${order.vendorLocation.lng}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-xs font-bold text-blue-700 backdrop-blur-sm transition hover:bg-blue-500/20"
                                                            >
                                                                <MapPin size={14} /> Track Order
                                                            </a>
                                                        )}
                                                        {isEligibleForCancel && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCancelOrder(order.id)}
                                                                className="flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 backdrop-blur-sm px-4 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-500/20"
                                                            >
                                                                <XCircle size={14} /> Cancel Order
                                                            </button>
                                                        )}
                                                        {isEligibleForConcern && !isEligibleForCancel && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedOrderForConcern(order);
                                                                    setConcernReason("");
                                                                    setConcernPhoto(null);
                                                                    setPhotoPreviewUrl(null);
                                                                }}
                                                                className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 backdrop-blur-sm px-4 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-500/20"
                                                            >
                                                                <AlertTriangle size={14} /> Raise Concern
                                                            </button>
                                                        )}
                                                        {(order.orderStatus === "placed" || order.orderStatus === "collected" || order.orderStatus === "resolved") && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedOrderForReview(order);
                                                                    setReviewRating(5);
                                                                    setReviewComment("");
                                                                }}
                                                                className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-400/20 to-orange-400/20 backdrop-blur-sm px-4 py-1.5 text-xs font-bold text-amber-900 shadow-sm transition hover:from-amber-400/30 hover:to-orange-400/30 active:scale-95"
                                                            >
                                                                <Star size={14} className="fill-amber-600 text-amber-600" /> Write Review
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Side: Pickup Code Box */}
                                            <div className="flex justify-center md:col-span-4 mt-6 md:mt-0">
                                                <div className="w-full max-w-[220px] rounded-3xl border border-white/60 bg-white/40 backdrop-blur-md p-6 text-center shadow-sm relative overflow-hidden flex flex-col items-center justify-center">
                                                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-brand-primary/20 rounded-full blur-xl pointer-events-none"></div>
                                                    <Ticket className="text-brand-primary/60 mb-2" size={28} />
                                                    <p className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/50">
                                                        PICKUP CODE
                                                    </p>
                                                    <p className="mt-2 font-display text-2xl font-black tracking-widest text-brand-primary drop-shadow-sm">
                                                        {order.pickupCode ? `PKB-${order.pickupCode}` : "—"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="mt-6 flex justify-center">
                                <Pagination
                                    page={page}
                                    totalPages={Math.ceil(currentOrders.length / limit)}
                                    total={currentOrders.length}
                                    limit={limit}
                                    onPageChange={setPage}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Raise Concern Modal */}
                {selectedOrderForConcern && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/40 p-4 backdrop-blur-md">
                        <div className="w-full max-w-lg rounded-3xl bg-white/80 backdrop-blur-xl p-6 shadow-2xl border border-white/50">
                            <div className="flex items-center justify-between border-b border-gray-200/50 pb-4">
                                <h3 className="text-xl font-display font-bold text-gray-900">Raise Order Concern</h3>
                                <button
                                    type="button"
                                    onClick={() => setSelectedOrderForConcern(null)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/50 text-gray-500 hover:bg-white/80 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleRaiseConcernSubmit} className="mt-4 space-y-4">
                                <p className="text-xs text-gray-500">
                                    Submitting a concern for order <span className="font-semibold text-gray-800">ORD-{selectedOrderForConcern.id.slice(-5).toUpperCase()}</span> ({selectedOrderForConcern.hotelName}). Please upload photo evidence taken during the pickup window.
                                </p>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                                        Description / Issue Details *
                                    </label>
                                    <textarea
                                        rows={3}
                                        required
                                        value={concernReason}
                                        onChange={(e) => setConcernReason(e.target.value)}
                                        placeholder="Describe the issue with your order..."
                                        className="mt-1 w-full rounded-2xl border border-gray-200 p-3 text-sm focus:border-green-600 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                                        Photo Evidence (EXIF Timestamp Verification) *
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        required
                                        onChange={handlePhotoSelect}
                                        className="mt-1 w-full text-xs text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-green-700 hover:file:bg-green-100"
                                    />
                                    {photoPreviewUrl && (
                                        <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200">
                                            <img
                                                src={photoPreviewUrl}
                                                alt="Evidence preview"
                                                className="h-40 w-full object-cover"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-3 border-t border-gray-200/50 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedOrderForConcern(null)}
                                        className="rounded-full border border-gray-300 bg-white/50 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-white/80"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingConcern}
                                        className="rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                                    >
                                        {isSubmittingConcern ? "Submitting..." : "Submit Concern"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Rate & Review Hotel Modal */}
                {selectedOrderForReview && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/40 p-4 backdrop-blur-md">
                        <div className="w-full max-w-lg rounded-3xl bg-white/80 backdrop-blur-xl p-6 shadow-2xl border border-white/50">
                            <div className="flex items-center justify-between border-b border-gray-200/50 pb-4">
                                <div>
                                    <h3 className="text-xl font-display font-bold text-gray-900">Rate & Review Hotel</h3>
                                    <p className="text-xs font-semibold text-gray-500 mt-1">{selectedOrderForReview.hotelName}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedOrderForReview(null)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/50 text-gray-500 hover:bg-white/80 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                                        Your Rating *
                                    </label>
                                    <div className="mt-2 flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewRating(star)}
                                                className={`transition transform hover:scale-110 focus:outline-none ${star <= reviewRating ? 'text-amber-500' : 'text-gray-300'}`}
                                            >
                                                <Star size={32} className={star <= reviewRating ? 'fill-amber-500' : 'fill-transparent'} />
                                            </button>
                                        ))}
                                        <span className="ml-2 text-sm font-semibold text-gray-700">
                                            {reviewRating}/5 Stars
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                                        Your Review Comment *
                                    </label>
                                    <textarea
                                        rows={4}
                                        required
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        placeholder="How was the food quality, pickup experience, and value for money?"
                                        className="mt-1 w-full rounded-2xl border border-gray-200 p-3 text-sm focus:border-green-600 focus:outline-none"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 border-t border-gray-200/50 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedOrderForReview(null)}
                                        className="rounded-full border border-gray-300 bg-white/50 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-white/80"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingReview}
                                        className="rounded-full bg-green-700 px-6 py-2 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
                                    >
                                        {isSubmittingReview ? "Publishing..." : "Publish Review"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrdersPage;
