
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

import { getHotelReviews, submitReview, type ReviewItem, type RatingStats } from "../../services/review.service"

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

    const [reviewsData, setReviewsData] =
        useState<{ reviews: ReviewItem[]; stats: RatingStats } | null>(null)

    // Direct Hotel Review Modal State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
    const [reviewRating, setReviewRating] = useState(5)
    const [reviewComment, setReviewComment] = useState("")
    const [isSubmittingReview, setIsSubmittingReview] = useState(false)

    const fetchReviews = async () => {
        if (!hotelId) return;
        try {
            const revRes = await getHotelReviews(hotelId)
            setReviewsData(revRes)
        } catch (rErr) {
            console.error("Failed to load reviews:", rErr)
        }
    }

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

                    // Fetch reviews
                    try {
                        const revRes = await getHotelReviews(hotelId)
                        setReviewsData(revRes)
                    } catch (rErr) {
                        console.error("Failed to load reviews:", rErr)
                    }
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

    const handleDirectReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hotelId) return;
        if (!reviewComment.trim()) {
            toast.error("Please enter a review comment");
            return;
        }

        try {
            setIsSubmittingReview(true);
            await submitReview({
                hotelId,
                rating: reviewRating,
                comment: reviewComment.trim(),
            });
            toast.success("Thank you! Your review for this hotel has been published.");
            setIsReviewModalOpen(false);
            setReviewComment("");
            setReviewRating(5);
            await fetchReviews();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to submit review");
        } finally {
            setIsSubmittingReview(false);
        }
    };

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

                            <div className="mt-2 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-gray-900 shadow-sm">
                                    ⭐ {reviewsData?.stats?.averageRating ? reviewsData.stats.averageRating.toFixed(1) : "New"}
                                </span>
                                <span className="text-xs text-green-100 font-medium">
                                    {reviewsData?.stats?.totalReviews ? `(${reviewsData.stats.totalReviews} customer reviews)` : "(No reviews yet)"}
                                </span>
                            </div>

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

                {/* Customer Reviews Section */}
                <section className="mt-10 rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Customer Reviews & Ratings</h2>
                            <p className="mt-1 text-xs text-gray-500">Real feedback from verified food pickup orders</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setReviewRating(5);
                                    setReviewComment("");
                                    setIsReviewModalOpen(true);
                                }}
                                className="flex items-center gap-1.5 rounded-full bg-green-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-green-800 active:scale-95"
                            >
                                <span>⭐</span> Write a Review
                            </button>
                            {reviewsData?.stats && (
                                <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-2 border border-amber-200">
                                    <span className="text-xl font-black text-amber-700">{reviewsData.stats.averageRating || 0}</span>
                                    <div>
                                        <div className="flex text-amber-500 text-xs">
                                            {"⭐".repeat(Math.round(reviewsData.stats.averageRating || 5))}
                                        </div>
                                        <p className="text-[10px] text-gray-600 font-medium">{reviewsData.stats.totalReviews} Reviews</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {!reviewsData?.reviews || reviewsData.reviews.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-500">
                            No customer reviews published yet for this hotel. Be the first to order and share your experience!
                        </div>
                    ) : (
                        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                            {reviewsData.reviews.map((rev) => (
                                <div key={rev._id} className="rounded-2xl border border-gray-100 bg-[#faf7f2] p-4 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-700 text-xs font-bold text-white uppercase">
                                                    {rev.userName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-900">{rev.userName}</h4>
                                                    <div className="flex text-xs text-amber-500">
                                                        {"⭐".repeat(rev.rating)}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[11px] text-gray-400">
                                                {new Date(rev.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-xs leading-relaxed text-gray-700">
                                            "{rev.comment}"
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Direct Hotel Review Modal */}
                {isReviewModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
                                    <p className="text-xs text-gray-500">{menu.hotelName}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsReviewModalOpen(false)}
                                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleDirectReviewSubmit} className="mt-4 space-y-4">
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
                                                className="text-3xl transition transform hover:scale-110 focus:outline-none"
                                            >
                                                {star <= reviewRating ? "⭐" : "☆"}
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
                                        placeholder="Share your experience with this restaurant's food quality, service, and pickup experience..."
                                        className="mt-1 w-full rounded-2xl border border-gray-200 p-3 text-sm focus:border-green-600 focus:outline-none"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsReviewModalOpen(false)}
                                        className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
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
    )
}

export default LiveHotelMenuPage

