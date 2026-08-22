import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import toast from "react-hot-toast";

interface CheckoutLocationState {
    orderId: string;
    clientSecret: string;
    totalAmount: number;
    currency: string;
}

interface PaymentFormProps {
    orderId: string;
    totalAmount: number;
    currency: string;
}

const stripePublishableKey: string =
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51U2yeI2Le4E4oyQiw4p4bCrRZozEROyeZyTcA0vsAlvpqt5gJH2GY7tKRYSHom6Fc1R9hPUfruWoYmQ3mdQGWXjU00XCI0ESxB";

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const PaymentForm = ({ orderId, totalAmount, currency }: PaymentFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isPaying, setIsPaying] = useState(false);
    const navigate=useNavigate()

    const formattedAmount = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency.toUpperCase(),
    }).format(totalAmount);
const handlePayment = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!stripe || !elements) {
        toast.error("Payment form is still loading");
        return;
    }

    try {
        setIsPaying(true);

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/payment-success?orderId=${orderId}`,
            },
            redirect: "if_required",
        });

        if (result.error) {
            toast.error(result.error.message ?? "Payment failed");
            return;
        }

        if (result.paymentIntent.status === "succeeded" || result.paymentIntent.status === "processing") {
            navigate(`/payment-success?orderId=${orderId}`, {
                replace: true,
            });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to process payment";
        toast.error(message);
    } finally {
        setIsPaying(false);
    }
};

    return (
        <form onSubmit={handlePayment}>
            <PaymentElement />

            <button
                type="submit"
                disabled={!stripe || !elements || isPaying}
                className="mt-6 w-full rounded-full bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
                {isPaying ? "Processing payment..." : `Pay ${formattedAmount}`}
            </button>

            <p className="mt-3 text-center text-xs text-gray-500">
                Your order is confirmed only after Stripe verifies the payment.
            </p>
        </form>
    );
};

const CheckoutPage = () => {
    const location = useLocation();
    const checkout = location.state as CheckoutLocationState | null;

    if (!checkout?.clientSecret || !checkout.orderId) {
        toast.error("Checkout information is missing");
        return <Navigate to="/cart" replace />;
    }

    if (!stripePromise) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#faf7ef] px-5">
                <div className="rounded-2xl border border-red-200 bg-white p-7 text-center shadow-sm">
                    <h1 className="text-xl font-bold text-red-700">
                        Stripe configuration is missing
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        Add VITE_STRIPE_PUBLISHABLE_KEY to the frontend environment file.
                    </p>
                </div>
            </div>
        );
    }

    const elementsOptions: StripeElementsOptions = {
        clientSecret: checkout.clientSecret,
        appearance: {
            theme: "stripe",
            variables: {
                colorPrimary: "#15803d",
                borderRadius: "12px",
            },
        },
    };

    return (
        <div className="min-h-screen bg-[#faf7ef] px-4 py-10">
            <div className="mx-auto max-w-lg rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">
                    Complete payment
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    Pay securely using Stripe test mode.
                </p>

                <div className="my-6 rounded-xl bg-green-50 p-4">
                    <p className="text-xs font-medium text-gray-500">
                        Order total
                    </p>

                    <p className="mt-1 text-2xl font-bold text-green-800">
                        {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: checkout.currency.toUpperCase(),
                        }).format(checkout.totalAmount)}
                    </p>
                </div>

                <Elements stripe={stripePromise} options={elementsOptions}>
                    <PaymentForm
                        orderId={checkout.orderId}
                        totalAmount={checkout.totalAmount}
                        currency={checkout.currency}
                    />
                </Elements>
            </div>
        </div>
    );
};

export default CheckoutPage;