import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, type Order } from "../../services/order.service";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ArrowLeft, Clock, Package, Receipt, ShoppingBag, Store, Tag } from "lucide-react";
import toast from "react-hot-toast";

const OrderDetailsPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        if (!orderId) throw new Error("Order ID is missing");
        const response = await getOrderById(orderId);
        setOrder(response.data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load order details";
        toast.error(message);
        navigate("/orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!order) {
    return null; // Will navigate away from catch block
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: order.currency || "INR",
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  const formatPickupTime = (timeString?: string) => {
    if (!timeString) return "N/A";
    return new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(timeString));
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending_payment: "bg-yellow-100 text-yellow-800 border-yellow-200",
      placed: "bg-blue-100 text-blue-800 border-blue-200",
      collected: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      expired: "bg-gray-100 text-gray-800 border-gray-200",
      concern_raised: "bg-orange-100 text-orange-800 border-orange-200",
      resolved: "bg-teal-100 text-teal-800 border-teal-200",
    };

    const labels: Record<string, string> = {
      pending_payment: "Pending Payment",
      placed: "Order Placed",
      collected: "Collected",
      cancelled: "Cancelled",
      expired: "Expired",
      concern_raised: "Concern Raised",
      resolved: "Resolved",
    };

    const style = styles[status] || "bg-gray-100 text-gray-800 border-gray-200";
    const label = labels[status] || status;

    return (
      <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${style}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate("/orders")}
        className="mb-6 flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-green-700"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </button>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
        {/* Header section */}
        <div className="border-b border-gray-100 bg-gray-50/50 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</h1>
              <p className="mt-1 text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(order.orderStatus)}
            </div>
          </div>
        </div>

        {/* Pickup Code Banner (if active) */}
        {order.orderStatus === "placed" && order.pickupCode && (
          <div className="bg-green-50 p-6 sm:p-8 border-b border-green-100 text-center">
            <h3 className="text-sm font-medium text-green-800 uppercase tracking-widest mb-2">Your Pickup Code</h3>
            <div className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 shadow-sm border border-green-200">
              <span className="text-4xl font-mono font-bold tracking-[0.25em] text-green-700 mr-[-0.25em]">
                {order.pickupCode}
              </span>
            </div>
            <p className="mt-4 text-sm text-green-700 max-w-md mx-auto">
              Show this code to the restaurant staff when picking up your food.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Main content - Items */}
          <div className="md:col-span-2 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-gray-100">
            <h2 className="mb-6 flex items-center text-lg font-semibold text-gray-900">
              <ShoppingBag className="mr-2 h-5 w-5 text-gray-400" />
              Order Items
            </h2>

            <ul className="divide-y divide-gray-100">
              {order.items.map((item, index) => (
                <li key={index} className="flex py-4 first:pt-0 last:pb-0 gap-4">
                  {item.itemImageUrl ? (
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.itemImageUrl}
                        alt={item.itemName}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-20 flex-shrink-0 rounded-md border border-gray-200 bg-gray-100 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col justify-center">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3>{item.itemName}</h3>
                      <p className="ml-4">{formatCurrency(item.subTotal)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Qty: {item.quantity} {item.unitType === "portion" ? "Portion(s)" : "Item(s)"}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-gray-900">Subtotal</span>
                <span className="text-base font-medium text-gray-900">{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-green-700">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Sidebar - Details */}
          <div className="p-6 sm:p-8 bg-gray-50/30">
            <h2 className="mb-6 flex items-center text-lg font-semibold text-gray-900">
              <Receipt className="mr-2 h-5 w-5 text-gray-400" />
              Order Summary
            </h2>

            <dl className="space-y-6 text-sm">
              <div>
                <dt className="flex items-center font-medium text-gray-900 mb-2">
                  <Store className="mr-2 h-4 w-4 text-gray-400" />
                  Restaurant
                </dt>
                <dd className="text-gray-600 pl-6">
                  {order.hotelName || "Unknown Restaurant"}
                </dd>
              </div>

              {order.pickupWindow && (
                <div>
                  <dt className="flex items-center font-medium text-gray-900 mb-2">
                    <Clock className="mr-2 h-4 w-4 text-gray-400" />
                    Pickup Window
                  </dt>
                  <dd className="text-gray-600 pl-6 flex flex-col gap-1">
                    <span>
                      {formatDate(order.pickupWindow.startTime).split(',')[0]}
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatPickupTime(order.pickupWindow.startTime)} - {formatPickupTime(order.pickupWindow.endTime)}
                    </span>
                  </dd>
                </div>
              )}

              <div>
                <dt className="flex items-center font-medium text-gray-900 mb-2">
                  <Tag className="mr-2 h-4 w-4 text-gray-400" />
                  Payment Status
                </dt>
                <dd className="text-gray-600 pl-6 capitalize">
                  {order.paymentStatus.replace("_", " ")}
                </dd>
              </div>

              {order.collectedAt && (
                <div>
                  <dt className="flex items-center font-medium text-gray-900 mb-2">
                    <Package className="mr-2 h-4 w-4 text-gray-400" />
                    Collected At
                  </dt>
                  <dd className="text-gray-600 pl-6">
                    {formatDate(order.collectedAt)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
