import { useState } from "react";
import type { FormEvent } from "react";
import type { DailyMenuItem,MenuUnitType,UpdateDailyMenuItemData } from "../../services/menu.service";

interface EditMenuItemFormProps {
    item: DailyMenuItem;
    isSubmitting: boolean;

    onSubmit: (
        data: UpdateDailyMenuItemData
    ) => Promise<void>;

    onCancel: () => void;
}

const unitTypes: MenuUnitType[] = [
    "full",
    "half",
    "quarter",
    "piece",
    "number",
];

const EditMenuItemForm = ({
    item,
    isSubmitting,
    onSubmit,
    onCancel,
}: EditMenuItemFormProps) => {
    const [itemName, setItemName] = useState(item.itemName);
    const [unitType, setUnitType] = useState<MenuUnitType>(item.unitType);
    const [originalPrice, setOriginalPrice] = useState(String(item.originalPrice));
    const [discountedPrice, setDiscountedPrice] = useState(String(item.discountedPrice));
    const [stockQuantity, setStockQuantity] = useState(String(item.stockQuantity));
    const [isAvailable, setIsAvailable] = useState(item.isAvailable);

    const [prevItem, setPrevItem] = useState(item);
    if (prevItem !== item) {
        setPrevItem(item);
        setItemName(item.itemName);
        setUnitType(item.unitType);
        setOriginalPrice(String(item.originalPrice));
        setDiscountedPrice(String(item.discountedPrice));
        setStockQuantity(String(item.stockQuantity));
        setIsAvailable(item.isAvailable);
    }

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        await onSubmit({
            itemName: itemName.trim(),
            unitType,
            originalPrice: Number(originalPrice),
            discountedPrice: Number(discountedPrice),
            stockQuantity: Number(stockQuantity),
            isAvailable,
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-gray-200 bg-white p-5"
        >
            <h3 className="text-lg font-semibold text-gray-900">
                Edit menu item
            </h3>

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Item name
                </label>

                <input
                    type="text"
                    value={itemName}
                    onChange={(event) =>
                        setItemName(event.target.value)
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Unit type
                </label>

                <select
                    value={unitType}
                    onChange={(event) =>
                        setUnitType(
                            event.target.value as MenuUnitType
                        )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                    {unitTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Original price
                    </label>

                    <input
                        type="number"
                        min="1"
                        value={originalPrice}
                        onChange={(event) =>
                            setOriginalPrice(event.target.value)
                        }
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Discounted price
                    </label>

                    <input
                        type="number"
                        min="1"
                        value={discountedPrice}
                        onChange={(event) =>
                            setDiscountedPrice(event.target.value)
                        }
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                </div>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Stock quantity
                </label>

                <input
                    type="number"
                    min="0"
                    step="1"
                    value={stockQuantity}
                    onChange={(event) =>
                        setStockQuantity(event.target.value)
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
            </div>

            <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(event) =>
                        setIsAvailable(event.target.checked)
                    }
                />

                <span className="text-sm font-medium">
                    Item is available
                </span>
            </label>

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white disabled:opacity-60"
                >
                    {isSubmitting
                        ? "Updating..."
                        : "Update item"}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default EditMenuItemForm;