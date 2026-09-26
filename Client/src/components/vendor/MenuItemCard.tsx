import type { DailyMenuItem } from "../../services/menu.service";

interface MenuItemCardProps {
    item: DailyMenuItem;
    onEdit: (item: DailyMenuItem) => void;
}

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(price);
};

const MenuItemCard = ({
    item,
    onEdit
}: MenuItemCardProps) => {
    const discountPercentage = Math.round(
        ((item.originalPrice -
            item.discountedPrice) /
            item.originalPrice) *
            100
    );
    const isAvailable=item.isAvailable&&item.stockQuantity>0

    return (
        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
            <div className="relative h-48 w-full overflow-hidden sm:h-56">
                {item.itemImageUrl ? (
                    <img 
                        src={item.itemImageUrl} 
                        alt={item.itemName} 
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" 
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-500">
                        No food image available
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="line-clamp-2 text-lg font-bold leading-tight text-gray-900">
                            {item.itemName}
                        </h3>
                        <p className="mt-1 text-sm capitalize text-gray-500">
                            {item.unitType}
                        </p>
                    </div>

                    <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                            isAvailable 
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        {isAvailable ? "Available" : "Unavailable"}
                    </span>
                </div>

                <div className="mt-4 flex flex-wrap items-end gap-2">
                    <p className="text-xl font-bold text-green-700">
                        {formatPrice(item.discountedPrice)}
                    </p>
                    <p className="mb-0.5 text-sm text-gray-400 line-through">
                        {formatPrice(item.originalPrice)}
                    </p>
                    <span className="mb-0.5 rounded-md bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                        {discountPercentage}% off
                    </span>
                </div>

                <div className="mt-auto pt-5">
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                        <p className="text-sm text-gray-600">
                            Remaining stock:{" "}
                            <span className="font-semibold text-gray-900">
                                {item.stockQuantity}
                            </span>
                        </p>
                        <button
                            type="button"
                            onClick={() => onEdit(item)}
                            className="rounded-lg border border-green-700 bg-white px-4 py-1.5 text-sm font-semibold text-green-700 transition hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default MenuItemCard;