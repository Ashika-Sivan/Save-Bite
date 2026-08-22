import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { AppDispatch } from "../../redux/store";
import { clearCart } from "../../redux/cartSlice";
import { verifyPayment, type Order } from "../../services/order.service";

const PaymentSuccessPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const orderId = searchParams.get("orderId");

    const [order, setOrder] = useState<Order | null>(null);
    const [isChecking, setIsChecking] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let isCancelled = false;
        let timeoutId: number | undefined;

        const checkOrder = async (attempt: number): Promise<void> => {
            if (!orderId) {
                setErrorMessage("Order ID is missing");
                setIsChecking(false);
                return;
            }

            try {
                const response = await verifyPayment(orderId);

                if (isCancelled) return;

                const currentOrder = response.data;
                setOrder(currentOrder);

                if (currentOrder.paymentStatus === "paid") {
                    dispatch(clearCart());
                    setIsChecking(false);
                    return;
                }

                if (currentOrder.paymentStatus === "failed" || currentOrder.orderStatus === "cancelled") {
                    setIsChecking(false);
                    return;
                }

                if (attempt >= 10) {
                    setIsChecking(false);
                    return;
                }

                timeoutId = window.setTimeout(() => {
                    void checkOrder(attempt + 1);
                }, 2000);
            } catch {
                if (!isCancelled) {
                    setErrorMessage("Unable to verify your order");
                    setIsChecking(false);
                }
            }
        };

        void checkOrder(0);

        return () => {
            isCancelled = true;

            if (timeoutId !== undefined) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [dispatch, orderId]);

    const formatTime = (value: string): string => {
        return new Intl.DateTimeFormat("en-IN", {
            hour: "numeric",
            minute: "2-digit",
        }).format(new Date(value));
    };

    if (isChecking) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#faf7ef] px-5">
                <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />

                    <h1 className="mt-5 text-xl font-bold text-gray-900">
                        Verifying payment
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Please wait while Stripe confirms your payment.
                    </p>
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#faf7ef] px-5">
                <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
                    <h1 className="text-xl font-bold text-red-700">
                        Unable to verify payment
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        {errorMessage}
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/cart")}
                        className="mt-6 rounded-full bg-green-700 px-6 py-3 font-semibold text-white"
                    >
                        Return to cart
                    </button>
                </div>
            </div>
        );
    }

    if (!order || order.paymentStatus !== "paid") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#faf7ef] px-5">
                <div className="w-full max-w-md rounded-3xl border border-orange-200 bg-white p-8 text-center shadow-sm">
                    <h1 className="text-xl font-bold text-orange-700">
                        Payment confirmation pending
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        Stripe has not confirmed this payment yet. Your cart has not been cleared.
                    </p>

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-6 rounded-full bg-green-700 px-6 py-3 font-semibold text-white"
                    >
                        Check again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#faf7ef] px-5 py-10">
            <div className="w-full max-w-lg rounded-3xl border border-green-200 bg-white p-8 text-center shadow-sm">
                <div className="text-5xl">
                    ✅
                </div>

                <h1 className="mt-4 text-2xl font-bold text-green-800">
                    Payment successful
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    Your food has been reserved. Show the pickup code to the vendor.
                </p>

                <div className="mt-6 rounded-2xl bg-green-50 p-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Pickup code
                    </p>

                    <p className="mt-2 text-4xl font-black tracking-widest text-green-800">
                        {order.pickupCode}
                    </p>
                </div>

                {order.pickupWindow && (
                    <div className="mt-5 rounded-xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">
                            Collect your food before
                        </p>

                        <p className="mt-1 text-lg font-bold text-gray-900">
                            {formatTime(order.pickupWindow.endTime)}
                        </p>
                    </div>
                )}

                <p className="mt-5 text-sm font-semibold text-gray-800">
                    Total paid: ₹{order.totalAmount}
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="mt-7 rounded-full bg-green-700 px-7 py-3 font-semibold text-white hover:bg-green-800"
                >
                    Return home
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;