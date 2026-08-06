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

    return (
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">
                        {item.itemName}
                    </h3>

                    <p className="mt-1 text-sm capitalize text-gray-500">
                        {item.unitType}
                    </p>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.isAvailable &&
                        item.stockQuantity > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                    }`}
                >
                    {item.isAvailable &&
                    item.stockQuantity > 0
                        ? "Available"
                        : "Unavailable"}
                </span>
            </div>
            <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="rounded-lg border border-green-700 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
                >
                    Edit
            </button>

            <div className="mt-5 flex items-end gap-3">
                <p className="text-xl font-bold text-green-700">
                    {formatPrice(
                        item.discountedPrice
                    )}
                </p>

                <p className="text-sm text-gray-400 line-through">
                    {formatPrice(
                        item.originalPrice
                    )}
                </p>

                <span className="rounded-md bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                    {discountPercentage}% off
                </span>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-600">
                    Remaining stock:{" "}
                    <span className="font-semibold text-gray-900">
                        {item.stockQuantity}
                    </span>
                </p>
            </div>
        </article>
    );
};

export default MenuItemCard;