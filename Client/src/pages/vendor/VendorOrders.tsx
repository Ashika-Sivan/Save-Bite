import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Clock,
  CheckCircle2,
  XCircle,
  KeyRound,
  Search,
  RefreshCw,
  Calendar,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ShoppingBag,
} from "lucide-react";
import { getVendorOrders, redeemPickupCode, type Order } from "../../services/order.service";
import { getVendorHotels } from "../../services/hotel.service";
import type { Hotel } from "../../types/hotel.types";

type StatusFilter = "ALL" | "PLACED" | "COLLECTED" | "EXPIRED_CANCELLED";

export default function VendorOrders() {

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Modal State for Pickup Code Verification
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pickupCodeInput, setPickupCodeInput] = useState<string>("");
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const fetchOrders = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true);
      const response = await getVendorOrders();
      if (response.success && Array.isArray(response.data)) {
        setOrders(response.data);
        if (showRefreshToast) toast.success("Orders refreshed");
      }
    } catch (error: unknown) {
      console.error("Failed to fetch vendor orders:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getVendorOrders().catch(() => null),
      getVendorHotels().catch(() => null)
    ])
      .then(([ordersRes, hotelsRes]) => {
        if (isMounted) {
          if (ordersRes?.success && Array.isArray(ordersRes?.data)) {
            setOrders(ordersRes.data);
          }
          if (hotelsRes?.success && Array.isArray(hotelsRes?.data) && hotelsRes.data.length > 0) {
            setHotels(hotelsRes.data);
            setSelectedHotelId(hotelsRes.data[0]._id);
          }
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          console.error("Failed to fetch data:", error);
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err?.response?.data?.message || "Failed to load orders");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenRedeemModal = (order: Order) => {
    setSelectedOrder(order);
    setPickupCodeInput("");
    setVerificationError(null);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setPickupCodeInput("");
    setVerificationError(null);
  };

  const handleRedeemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupCodeInput.trim()) {
      setVerificationError("Please enter the pickup code");
      return;
    }

    setVerifying(true);
    setVerificationError(null);

    try {
      const res = await redeemPickupCode(pickupCodeInput.trim());
      if (res.success && res.data) {
        toast.success("Pickup code verified! Order marked as collected 🎉");
        setOrders((prev) =>
          prev.map((o) => (o.id === res.data.id ? { ...o, ...res.data } : o))
        );
        handleCloseModal();
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj?.response?.data?.message || "Failed to redeem pickup code";
      setVerificationError(msg);
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedHotelId && order.hotelId !== selectedHotelId) return false;
    if (activeFilter === "PLACED" && order.orderStatus !== "placed") return false;
    if (activeFilter === "COLLECTED" && order.orderStatus !== "collected") return false;
    if (
      activeFilter === "EXPIRED_CANCELLED" &&
      order.orderStatus !== "expired" &&
      order.orderStatus !== "cancelled"
    )
      return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchHotel = order.hotelName?.toLowerCase().includes(q);
      const matchItems = order.items.some((i: { itemName: string }) => i.itemName.toLowerCase().includes(q));
      const matchCode = order.pickupCode?.toLowerCase().includes(q);
      return matchId || matchHotel || matchItems || matchCode;
    }
    return true;
  });

  const hotelOrders = selectedHotelId ? orders.filter((o) => o.hotelId === selectedHotelId) : orders;
  const pendingCount = hotelOrders.filter((o) => o.orderStatus === "placed").length;
  const collectedCount = hotelOrders.filter((o) => o.orderStatus === "collected").length;

  return (
    <main className="flex-1 p-5 md:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-1">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Customer Orders 📦
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage incoming food orders and verify customer pickup codes upon handover.
            </p>
          </div>

          {/* Direct Verify Pickup Code Trigger */}
          <button
            onClick={() => {
              setSelectedOrder(null);
              setPickupCodeInput("");
              setVerificationError(null);
              // Open modal directly for manual code input
              setSelectedOrder({ id: "manual" } as unknown as Order);
            }}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-amber-600 transition"
          >
            <KeyRound size={18} />
            Verify Pickup Code
          </button>
        </div>

        {/* Action Controls from old header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          <div className="relative text-right z-10">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 hover:bg-gray-50 transition border border-gray-200 shadow-sm"
            >
              <div className="text-left">
                <p className="font-semibold text-gray-800">
                  {hotels.find((h) => h._id === selectedHotelId)?.hotelName || "Loading..."}
                </p>
                <span className="text-sm font-medium text-green-700">Approved</span>
              </div>
              <ChevronDown size={20} className="text-gray-500" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg">
                <div className="p-2">
                  {hotels.map((hotel) => (
                    <button
                      key={hotel._id}
                      onClick={() => {
                        setSelectedHotelId(hotel._id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full rounded-lg px-4 py-2 text-left text-sm transition ${
                        selectedHotelId === hotel._id
                          ? "bg-green-50 text-green-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {hotel.hotelName}
                    </button>
                  ))}
                  {hotels.length === 0 && (
                    <p className="px-4 py-2 text-sm text-gray-500">No hotels found</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

            {/* Quick Stat Summary Cards */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Orders</p>
                <h4 className="mt-1 text-2xl font-bold text-gray-900">{hotelOrders.length}</h4>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Pending Pickups</p>
                <h4 className="mt-1 text-2xl font-bold text-amber-900">{pendingCount}</h4>
              </div>
              <div className="rounded-2xl border border-green-200 bg-green-50/50 p-4 shadow-sm col-span-2 sm:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-700">Completed Pickups</p>
                <h4 className="mt-1 text-2xl font-bold text-green-900">{collectedCount}</h4>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveFilter("ALL")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    activeFilter === "ALL"
                      ? "bg-green-700 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All ({hotelOrders.length})
                </button>
                <button
                  onClick={() => setActiveFilter("PLACED")}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    activeFilter === "PLACED"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Clock size={16} />
                  Pending Pickup ({pendingCount})
                </button>
                <button
                  onClick={() => setActiveFilter("COLLECTED")}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    activeFilter === "COLLECTED"
                      ? "bg-green-700 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <CheckCircle2 size={16} />
                  Collected ({collectedCount})
                </button>
                <button
                  onClick={() => setActiveFilter("EXPIRED_CANCELLED")}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    activeFilter === "EXPIRED_CANCELLED"
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <XCircle size={16} />
                  Expired / Cancelled
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders, items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-2 text-sm text-gray-800 focus:border-green-600 focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            {/* Orders List Section */}
            {loading ? (
              <div className="mt-12 flex flex-col items-center justify-center p-8">
                <RefreshCw size={36} className="animate-spin text-green-700" />
                <p className="mt-4 font-medium text-gray-600">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="mt-10 rounded-3xl border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center">
                <ShoppingBag className="mx-auto text-gray-300" size={56} />
                <h3 className="mt-4 text-xl font-bold text-gray-800">No orders found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchQuery
                    ? "No orders match your search criteria."
                    : activeFilter !== "ALL"
                    ? `No orders currently in '${activeFilter}' state.`
                    : "When customers place orders at your restaurant, they will appear here."}
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 bg-gray-50/80 px-6 py-4 gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-gray-500 uppercase">Order ID:</span>
                          <span className="font-mono text-sm font-bold text-gray-900">{order.id}</span>
                        </div>
                        {order.hotelName && (
                          <p className="text-xs font-semibold text-green-700 mt-0.5">{order.hotelName}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Order Status Badge */}
                        {order.orderStatus === "placed" && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-300">
                            <Clock size={14} />
                            Pending Pickup
                          </span>
                        )}
                        {order.orderStatus === "collected" && (
                          <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800 border border-green-300">
                            <CheckCircle2 size={14} />
                            Collected
                          </span>
                        )}
                        {order.orderStatus === "expired" && (
                          <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 border border-red-300">
                            <XCircle size={14} />
                            Expired
                          </span>
                        )}
                        {order.orderStatus === "cancelled" && (
                          <span className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-xs font-bold text-gray-700">
                            Cancelled
                          </span>
                        )}

                        {/* Payment Badge */}
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                          Paid: ₹{order.totalAmount}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <div className="grid gap-6 md:grid-cols-3">
                        {/* Items List */}
                        <div className="md:col-span-2 space-y-3">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400">Order Items</h5>
                          <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                                <div>
                                  <p className="font-semibold text-gray-900 text-sm">{item.itemName}</p>
                                  <p className="text-xs text-gray-500">
                                    Qty: {item.quantity} × ₹{item.price} ({item.unitType})
                                  </p>
                                </div>
                                <span className="font-bold text-gray-800 text-sm">₹{item.subTotal}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Timeline & Actions */}
                        <div className="flex flex-col justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400">Pickup Details</h5>

                            {order.pickupWindow ? (
                              <div className="text-xs text-gray-600 space-y-1">
                                <p className="flex items-center gap-1 font-medium">
                                  <Calendar size={14} className="text-gray-400" />
                                  Window:
                                </p>
                                <p className="pl-5 text-gray-800 font-semibold">
                                  {new Date(order.pickupWindow.startTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  -{" "}
                                  {new Date(order.pickupWindow.endTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            ) : null}

                            {order.collectedAt && (
                              <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded-lg border border-green-200">
                                <p className="font-semibold">Handed Over At:</p>
                                <p>{new Date(order.collectedAt).toLocaleString()}</p>
                              </div>
                            )}

                            {order.createdAt && (
                              <p className="text-[11px] text-gray-400 pt-2">
                                Placed: {new Date(order.createdAt).toLocaleString()}
                              </p>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            {order.orderStatus === "placed" ? (
                              <button
                                onClick={() => handleOpenRedeemModal(order)}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-green-800 transition"
                              >
                                <KeyRound size={16} />
                                Verify Pickup Code
                              </button>
                            ) : (
                              <div className="text-center text-xs font-medium text-gray-400 py-1.5 bg-gray-100 rounded-lg">
                                {order.orderStatus === "collected"
                                  ? "Order Completed & Collected ✅"
                                  : "Order Inactive"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

        {/* Pickup Code Verification Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
              {/* Modal Header */}
              <div className="bg-green-700 p-6 text-white text-center relative">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md">
                  <KeyRound size={28} />
                </div>
                <h3 className="mt-3 text-xl font-bold">Verify Pickup Code</h3>
                <p className="mt-1 text-xs text-green-100">
                  Enter the code provided by the customer to release the parcel.
                </p>
                <button
                  onClick={handleCloseModal}
                  className="absolute right-4 top-4 text-green-100 hover:text-white"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleRedeemSubmit} className="p-6">
                {selectedOrder.id !== "manual" && (
                  <div className="mb-4 rounded-xl bg-gray-50 p-3 text-xs border border-gray-200 flex justify-between items-center">
                    <div>
                      <span className="text-gray-500 font-mono">Order ID: </span>
                      <span className="font-bold text-gray-900">{selectedOrder.id}</span>
                    </div>
                    <span className="font-bold text-green-700 text-sm">₹{selectedOrder.totalAmount}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    6-Digit Pickup Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 847291"
                    value={pickupCodeInput}
                    onChange={(e) => setPickupCodeInput(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-center text-2xl font-mono font-bold tracking-widest text-gray-900 focus:border-green-600 focus:bg-white focus:outline-none shadow-inner"
                    maxLength={10}
                    autoFocus
                  />
                </div>

                {verificationError && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-600" />
                    <span>{verificationError}</span>
                  </div>
                )}

                {/* Modal Footer Buttons */}
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-1/2 rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verifying}
                    className="w-1/2 flex items-center justify-center gap-2 rounded-xl bg-green-700 py-3 text-sm font-bold text-white shadow-md hover:bg-green-800 transition disabled:opacity-50"
                  >
                    {verifying ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Verify & Hand Over
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

    </main>
  );
}
