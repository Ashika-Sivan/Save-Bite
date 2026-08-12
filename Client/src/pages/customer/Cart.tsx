import {
    useEffect,
    useState,
} from "react"
import axios from "axios"
import { createCheckout } from "../../services/order.service"

import {
    useDispatch,
    useSelector,
} from "react-redux"

import {
    useNavigate,
} from "react-router-dom"

import toast from "react-hot-toast"

import type {
    AppDispatch,
    RootState,
} from "../../redux/store"

import {
    clearCart,
    removeFromCart,
    updateCartQuantity,
} from "../../redux/cartSlice"

const CartPage = () => {
    const dispatch =
        useDispatch<AppDispatch>()

    const navigate =
        useNavigate()

    const cart =
        useSelector(
            (state: RootState) =>
                state.cart
        )

    /*
     * Used to automatically update
     * the checkout button when the
     * order cutoff passes.
     */
    const [currentTime, setCurrentTime] =
        useState(new Date())
    const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

    useEffect(() => {
        const intervalId =
            window.setInterval(() => {
                setCurrentTime(
                    new Date()
                )
            }, 30 * 1000)

        return () => {
            window.clearInterval(
                intervalId
            )
        }
    }, [])

    const formatTime = (
        value: string
    ): string => {
        return new Intl.DateTimeFormat(
            "en-IN",
            {
                hour: "numeric",
                minute: "2-digit",
            }
        ).format(new Date(value))
    }

    const totalItems =
        cart.items.reduce(
            (total, item) =>
                total + item.quantity,
            0
        )

    const originalTotal =
        cart.items.reduce(
            (total, item) =>
                total +
                item.originalPrice *
                item.quantity,
            0
        )

    const cartTotal =
        cart.items.reduce(
            (total, item) =>
                total +
                item.discountedPrice *
                item.quantity,
            0
        )

    const totalSavings =
        originalTotal - cartTotal

    /*
     * Ordering closes 30 minutes
     * before pickup closes.
     */
    const pickupEndTime =
        cart.pickupWindow
            ? new Date(
                cart.pickupWindow
                    .endTime
            )
            : null

    const hasValidPickupEnd =
        pickupEndTime !== null &&
        !Number.isNaN(
            pickupEndTime.getTime()
        )

    const orderCutoffTime =
        hasValidPickupEnd &&
            pickupEndTime
            ? new Date(
                pickupEndTime
                    .getTime() -
                30 *
                60 *
                1000
            )
            : null

    const isOrderingClosed =
        !orderCutoffTime ||
        currentTime.getTime() >=
        orderCutoffTime.getTime()



    const handleCheckout = async (): Promise<void> => {
        if (!cart.menuId) {
            toast.error("Menu information is missing");
            return;
        }

        if (cart.items.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        if (isOrderingClosed) {
            toast.error("Ordering has already closed");
            return;
        }

        try {
            setIsCreatingCheckout(true);

            const response = await createCheckout({
                menuId: cart.menuId,
                items: cart.items.map((item) => ({
                    itemId: item.itemId,
                    quantity: item.quantity,
                })),
            });

            navigate("/checkout", {
                state: {
                    orderId: response.data.orderId,
                    clientSecret: response.data.clientSecret,
                    totalAmount: response.data.totalAmount,
                    currency: response.data.currency,
                },
            });
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message ?? "Unable to create checkout");
                return;
            }

            toast.error("Unable to create checkout");
        } finally {
            setIsCreatingCheckout(false);
        }
    };

    const handleClearCart =
        (): void => {
            toast.custom(
                (currentToast) => (
                    <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-5 shadow-lg">
                        <h3 className="font-semibold text-gray-900">
                            Clear your cart?
                        </h3>

                        <p className="mt-2 text-sm text-gray-600">
                            All selected food
                            items will be removed.
                        </p>

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    toast.dismiss(
                                        currentToast.id
                                    )
                                }
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    dispatch(
                                        clearCart()
                                    )

                                    toast.dismiss(
                                        currentToast.id
                                    )

                                    toast.success(
                                        "Cart cleared"
                                    )
                                }}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                            >
                                Clear cart
                            </button>
                        </div>
                    </div>
                ),
                {
                    duration: Infinity,
                    position:
                        "top-center",
                }
            )
        }

    if (cart.items.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#faf7ef] px-5">
                <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-9 text-center shadow-sm">
                    <div className="text-5xl">
                        🛒
                    </div>

                    <h1 className="mt-4 text-2xl font-bold text-gray-900">
                        Your cart is empty
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Browse live
                        restaurants and add
                        discounted food to
                        your cart.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/")
                        }
                        className="mt-6 rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
                    >
                        Browse restaurants
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#faf7ef] px-4 py-6 text-gray-900">
            <div className="mx-auto max-w-6xl">
                <button
                    type="button"
                    onClick={() =>
                        navigate(-1)
                    }
                    className="mb-5 text-sm font-medium text-green-700 hover:underline"
                >
                    ← Continue browsing
                </button>

                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Your Cart
                        </h1>

                        <p className="mt-1 text-gray-500">
                            {cart.hotelName} ·{" "}
                            {totalItems}{" "}
                            {totalItems === 1
                                ? "item"
                                : "items"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={
                            handleClearCart
                        }
                        className="text-sm font-medium text-red-600 hover:underline"
                    >
                        Clear cart
                    </button>
                </div>

                <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_360px]">
                    <section className="space-y-4">
                        {cart.items.map(
                            (item) => (
                                <article
                                    key={
                                        item.itemId
                                    }
                                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                                >
                                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                                        <div>
                                            <h2 className="font-semibold">
                                                {
                                                    item.itemName
                                                }
                                            </h2>

                                            <p className="mt-1 text-sm capitalize text-gray-500">
                                                {
                                                    item.unitType
                                                }
                                            </p>

                                            <div className="mt-3">
                                                <span className="text-sm text-gray-400 line-through">
                                                    ₹
                                                    {
                                                        item.originalPrice
                                                    }
                                                </span>

                                                <span className="ml-2 font-bold text-green-800">
                                                    ₹
                                                    {
                                                        item.discountedPrice
                                                    }
                                                </span>
                                            </div>

                                            <p className="mt-2 text-xs text-gray-500">
                                                Available
                                                stock:{" "}
                                                {
                                                    item.availableStock
                                                }
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-5 sm:justify-end">
                                            <div className="flex items-center overflow-hidden rounded-full border border-gray-300">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        dispatch(
                                                            updateCartQuantity(
                                                                {
                                                                    itemId:
                                                                        item.itemId,

                                                                    quantity:
                                                                        item.quantity -
                                                                        1,
                                                                }
                                                            )
                                                        )
                                                    }
                                                    disabled={
                                                        item.quantity <=
                                                        1
                                                    }
                                                    aria-label={`Decrease ${item.itemName} quantity`}
                                                    className="px-4 py-2 text-lg hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    −
                                                </button>

                                                <span className="min-w-10 text-center font-semibold">
                                                    {
                                                        item.quantity
                                                    }
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        dispatch(
                                                            updateCartQuantity(
                                                                {
                                                                    itemId:
                                                                        item.itemId,

                                                                    quantity:
                                                                        item.quantity +
                                                                        1,
                                                                }
                                                            )
                                                        )
                                                    }
                                                    disabled={
                                                        item.quantity >=
                                                        item.availableStock
                                                    }
                                                    aria-label={`Increase ${item.itemName} quantity`}
                                                    className="px-4 py-2 text-lg hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <p className="min-w-20 text-right font-bold">
                                                ₹
                                                {item.discountedPrice *
                                                    item.quantity}
                                            </p>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    dispatch(
                                                        removeFromCart(
                                                            item.itemId
                                                        )
                                                    )

                                                    toast.success(
                                                        `${item.itemName} removed`
                                                    )
                                                }}
                                                className="text-sm font-medium text-red-600 hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            )
                        )}
                    </section>

                    <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
                        <h2 className="text-lg font-bold">
                            Order summary
                        </h2>

                        {cart.pickupWindow &&
                            orderCutoffTime &&
                            pickupEndTime && (
                                <div className="mt-4 space-y-3 rounded-xl bg-green-50 p-4">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">
                                            Order
                                            before
                                        </p>

                                        <p className="mt-1 font-bold text-orange-700">
                                            {formatTime(
                                                orderCutoffTime.toISOString()
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-gray-500">
                                            Pickup
                                        </p>

                                        <p className="mt-1 font-semibold text-green-900">
                                            After
                                            payment,
                                            before{" "}
                                            {formatTime(
                                                pickupEndTime.toISOString()
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}

                        <div className="mt-5 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Original total
                                </span>

                                <span>
                                    ₹
                                    {
                                        originalTotal
                                    }
                                </span>
                            </div>

                            <div className="flex justify-between text-green-700">
                                <span>
                                    Your savings
                                </span>

                                <span>
                                    − ₹
                                    {
                                        totalSavings
                                    }
                                </span>
                            </div>

                            <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold">
                                <span>
                                    Total
                                </span>

                                <span>
                                    ₹
                                    {cartTotal}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleCheckout}
                            disabled={isOrderingClosed || isCreatingCheckout}
                            className="mt-6 w-full rounded-full bg-green-700 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                            {isOrderingClosed
                                ? "Ordering closed"
                                : isCreatingCheckout
                                    ? "Creating checkout..."
                                    : "Proceed to checkout"}
                        </button>

                        <p
                            className={`mt-3 text-center text-xs ${isOrderingClosed
                                    ? "text-red-600"
                                    : "text-gray-500"
                                }`}
                        >
                            {isOrderingClosed
                                ? "The ordering cutoff for this menu has passed."
                                : "Stock, prices and cutoff will be checked again by the server before payment."}
                        </p>
                    </aside>
                </div>
            </div>
        </div>
    )
}

export default CartPage