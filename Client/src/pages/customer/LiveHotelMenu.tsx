
import {
    useEffect,
    useState,
} from "react"

import {
    useNavigate,
    useParams,
} from "react-router-dom"

import toast from "react-hot-toast"

import {
    useDispatch,
    useSelector,
} from "react-redux"

import type {
    AppDispatch,
    RootState,
} from "../../redux/store"

import {
    addToCart,
    replaceCart,
} from "../../redux/cartSlice"

import type {
    AddToCartPayload,
} from "../../redux/cartSlice"

import type {
    LiveMenuItem,
    LiveHotelMenu as LiveHotelMenuData,
} from "../../services/customerBrowse.service"

import {
    getLiveHotelMenu,
} from "../../services/customerBrowse.service"

const fallbackRestaurantImage =
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000"

const getImageUrl = (
    imageKey: string
): string => {
    if (/^https?:\/\//i.test(imageKey)) {
        return imageKey
    }

    const imageBaseUrl =
        import.meta.env.VITE_IMAGE_BASE_URL

    return imageBaseUrl
        ? `${imageBaseUrl.replace(/\/$/, "")}/${imageKey}`
        : fallbackRestaurantImage
}

const LiveHotelMenuPage = () => {
    const navigate = useNavigate()

    const dispatch =
        useDispatch<AppDispatch>()

    const cartHotelId =
        useSelector(
            (state: RootState) =>
                state.cart.hotelId
        )

    const { hotelId } = useParams<{
        hotelId: string
    }>()

    const [menu, setMenu] =
        useState<LiveHotelMenuData | null>(
            null
        )

    const [isLoading, setIsLoading] =
        useState(true)

    const [error, setError] =
        useState<string | null>(null)

    const [quantities, setQuantities] =
        useState<Record<string, number>>({})

    useEffect(() => {
        const fetchMenu =
            async (): Promise<void> => {
                if (!hotelId) {
                    setError(
                        "Invalid restaurant ID"
                    )

                    setIsLoading(false)
                    return
                }

                try {
                    setIsLoading(true)
                    setError(null)

                    const response =
                        await getLiveHotelMenu(
                            hotelId
                        )

                    setMenu(response.data)
                } catch (requestError) {
                    console.error(
                        "Failed to fetch menu:",
                        requestError
                    )

                    setError(
                        "This restaurant is not currently accepting orders."
                    )
                } finally {
                    setIsLoading(false)
                }
            }

        void fetchMenu()
    }, [hotelId])

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

    const getQuantity = (
        itemId: string
    ): number => {
        return quantities[itemId] ?? 1
    }

    const increaseQuantity = (
        itemId: string,
        availableStock: number
    ): void => {
        setQuantities((current) => {
            const currentQuantity =
                current[itemId] ?? 1

            if (
                currentQuantity >=
                availableStock
            ) {
                return current
            }

            return {
                ...current,
                [itemId]:
                    currentQuantity + 1,
            }
        })
    }

    const decreaseQuantity = (
        itemId: string
    ): void => {
        setQuantities((current) => {
            const currentQuantity =
                current[itemId] ?? 1

            if (currentQuantity <= 1) {
                return current
            }

            return {
                ...current,
                [itemId]:
                    currentQuantity - 1,
            }
        })
    }

    const handleAddToCart = (
        item: LiveMenuItem
    ): void => {
        if (!menu) {
            return
        }

        const payload: AddToCartPayload = {
            hotelId: menu.hotelId,
            menuId: menu.menuId,
            hotelName: menu.hotelName,

            pickupWindow: {
                startTime:
                    menu.pickupWindow
                        .startTime,

                endTime:
                    menu.pickupWindow
                        .endTime,
            },

            itemId: item.itemId,
            itemName: item.itemName,
            unitType: item.unitType,

            originalPrice:
                item.originalPrice,

            discountedPrice:
                item.discountedPrice,

            availableStock:
                item.stockQuantity,

            quantity:
                getQuantity(item.itemId),
        }

        if (
            cartHotelId &&
            cartHotelId !== menu.hotelId
        ) {
            toast.custom(
                (currentToast) => (
                    <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-5 shadow-lg">
                        <h3 className="font-semibold text-gray-900">
                            Replace current cart?
                        </h3>

                        <p className="mt-2 text-sm text-gray-600">
                            Your cart contains food
                            from another restaurant.
                            Clear it and add food from{" "}
                            {menu.hotelName}?
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
                                        replaceCart(
                                            payload
                                        )
                                    )

                                    toast.dismiss(
                                        currentToast.id
                                    )

                                    toast.success(
                                        "Cart replaced successfully"
                                    )
                                }}
                                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white"
                            >
                                Replace cart
                            </button>
                        </div>
                    </div>
                ),
                {
                    duration: Infinity,
                    position: "top-center",
                }
            )

            return
        }

        dispatch(addToCart(payload))

        toast.success(
            `${item.itemName} added to cart`
        )
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#faf7ef]">
                <p className="text-gray-500">
                    Loading menu...
                </p>
            </div>
        )
    }

    if (error || !menu) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#faf7ef] px-5">
                <p className="text-center text-red-600">
                    {error ?? "Menu not found"}
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="rounded-full bg-green-700 px-5 py-2 text-white transition hover:bg-green-800"
                >
                    Return home
                </button>
            </div>
        )
    }

    /*
     * Ordering closes 30 minutes
     * before pickup closes.
     */
    const pickupEndTime =
        new Date(
            menu.pickupWindow.endTime
        )

    const orderCutoffTime =
        new Date(
            pickupEndTime.getTime() -
            30 * 60 * 1000
        )

    return (
        <div className="min-h-screen bg-[#faf7ef] px-4 py-6">
            <div className="mx-auto max-w-6xl">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mb-5 text-sm font-medium text-green-700 hover:underline"
                >
                    ← Back to restaurants
                </button>

                <section className="overflow-hidden rounded-3xl bg-green-800 text-white shadow-lg">
                    <div className="grid md:grid-cols-2">
                        <img
                            src={getImageUrl(
                                menu.hotelImageKey
                            )}
                            alt={menu.hotelName}
                            onError={(event) => {
                                event.currentTarget
                                    .src =
                                    fallbackRestaurantImage
                            }}
                            className="h-64 w-full object-cover md:h-full md:min-h-80"
                        />

                        <div className="p-7 md:p-10">
                            <p className="text-sm text-green-100">
                                {menu.businessType}
                            </p>

                            <h1 className="mt-1 text-3xl font-bold">
                                {menu.hotelName}
                            </h1>

                            <p className="mt-2 text-green-100">
                                {menu.address}
                            </p>

                            <p className="mt-1 text-sm text-green-200">
                                {menu.place}
                            </p>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl bg-orange-500/20 px-4 py-3">
                                    <p className="text-xs font-medium text-orange-100">
                                        Order before
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-white">
                                        {formatTime(
                                            orderCutoffTime
                                                .toISOString()
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-white/15 px-4 py-3">
                                    <p className="text-xs font-medium text-green-100">
                                        Pickup
                                    </p>

                                    <p className="mt-1 font-semibold text-white">
                                        After payment,
                                        before{" "}
                                        {formatTime(
                                            menu
                                                .pickupWindow
                                                .endTime
                                        )}
                                    </p>
                                </div>
                            </div>

                            <p className="mt-3 text-xs text-green-100">
                                New orders close 30
                                minutes before pickup
                                closes.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mt-8">
                    <h2 className="text-xl font-bold">
                        Today&apos;s available food
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Select your quantity and add
                        items to the cart.
                    </p>

                    {menu.items.length === 0 ? (
                        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                            No food items are currently
                            available.
                        </div>
                    ) : (
                        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {menu.items.map(
                                (item) => {
                                    const quantity =
                                        getQuantity(
                                            item.itemId
                                        )

                                    const totalPrice =
                                        item.discountedPrice *
                                        quantity

                                    return (
                                        <article
                                            key={
                                                item.itemId
                                            }
                                            className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                        >
                                            <div className="relative">
                                                {item.itemImageUrl ? (
                                                    <img
                                                        src={
                                                            item.itemImageUrl
                                                        }
                                                        alt={
                                                            item.itemName
                                                        }
                                                        loading="lazy"
                                                        className="h-52 w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-52 w-full items-center justify-center bg-gray-100 px-4 text-center text-sm text-gray-500">
                                                        No
                                                        food
                                                        image
                                                        available
                                                    </div>
                                                )}

                                                {item.stockQuantity <=
                                                    5 && (
                                                    <span className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow">
                                                        Only{" "}
                                                        {
                                                            item.stockQuantity
                                                        }{" "}
                                                        left
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-1 flex-col p-5">
                                                <div>
                                                    <h3 className="line-clamp-2 text-lg font-bold capitalize text-gray-900">
                                                        {
                                                            item.itemName
                                                        }
                                                    </h3>

                                                    <p className="mt-1 text-sm capitalize text-gray-500">
                                                        {
                                                            item.unitType
                                                        }
                                                    </p>
                                                </div>

                                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                                    <span className="text-sm text-gray-400 line-through">
                                                        ₹
                                                        {
                                                            item.originalPrice
                                                        }
                                                    </span>

                                                    <span className="text-2xl font-bold text-green-800">
                                                        ₹
                                                        {
                                                            item.discountedPrice
                                                        }
                                                    </span>
                                                </div>

                                                <p className="mt-3 text-sm text-gray-500">
                                                    Available
                                                    stock:{" "}
                                                    <span className="font-semibold text-gray-800">
                                                        {
                                                            item.stockQuantity
                                                        }
                                                    </span>
                                                </p>

                                                <div className="mt-6 flex items-center justify-between gap-4 border-t border-gray-100 pt-5">
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        Quantity
                                                    </span>

                                                    <div className="flex items-center overflow-hidden rounded-full border border-gray-300 bg-white">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                decreaseQuantity(
                                                                    item.itemId
                                                                )
                                                            }
                                                            disabled={
                                                                quantity <=
                                                                1
                                                            }
                                                            aria-label={`Decrease ${item.itemName} quantity`}
                                                            className="flex h-10 w-11 items-center justify-center text-lg text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            −
                                                        </button>

                                                        <span className="min-w-10 text-center font-semibold text-gray-900">
                                                            {
                                                                quantity
                                                            }
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                increaseQuantity(
                                                                    item.itemId,
                                                                    item.stockQuantity
                                                                )
                                                            }
                                                            disabled={
                                                                quantity >=
                                                                item.stockQuantity
                                                            }
                                                            aria-label={`Increase ${item.itemName} quantity`}
                                                            className="flex h-10 w-11 items-center justify-center text-lg text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                                                    <span className="text-sm text-gray-500">
                                                        Total
                                                    </span>

                                                    <span className="text-lg font-bold text-green-800">
                                                        ₹
                                                        {
                                                            totalPrice
                                                        }
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleAddToCart(
                                                            item
                                                        )
                                                    }
                                                    disabled={
                                                        !item.isAvailable ||
                                                        item.stockQuantity ===
                                                            0
                                                    }
                                                    className="mt-5 w-full rounded-full bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Add to
                                                    cart
                                                </button>
                                            </div>
                                        </article>
                                    )
                                }
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

export default LiveHotelMenuPage

