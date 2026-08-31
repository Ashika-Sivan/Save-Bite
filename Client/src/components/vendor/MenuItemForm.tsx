import {
    useEffect,
    useState,
    type ChangeEvent,
} from "react";

import toast from "react-hot-toast";

import type {
    AddDailyMenuItemData,
    MenuUnitType,
} from "../../services/menu.service";

interface MenuItemFormProps {
    isSubmitting: boolean;

    onSubmit: (
        data: AddDailyMenuItemData
    ) => Promise<void>;
}

const MenuItemForm = ({
    isSubmitting,
    onSubmit,
}: MenuItemFormProps) => {
    const [itemName, setItemName] =
        useState("");

    const [unitType, setUnitType] =
        useState<MenuUnitType>("full");

    const [originalPrice, setOriginalPrice] =
        useState("");

    const [
        discountedPrice,
        setDiscountedPrice,
    ] = useState("");

    const [stockQuantity, setStockQuantity] =
        useState("");

    const [itemImage, setItemImage] =
        useState<File | null>(null);

    const [imagePreview, setImagePreview] =
        useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleImageChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const file =
            event.target.files?.[0] ?? null;

        if (!file) {
            setItemImage(null);
            setImagePreview(null);
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error(
                "Select a JPG, PNG, or WebP image"
            );

            event.target.value = "";
            return;
        }

        const maximumSize = 5 * 1024 * 1024;

        if (file.size > maximumSize) {
            toast.error(
                "Food image must be smaller than 5 MB"
            );

            event.target.value = "";
            return;
        }

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        setItemImage(file);
        setImagePreview(
            URL.createObjectURL(file)
        );
    };

    const handleSubmit = async () => {

        const trimmedItemName =
            itemName.trim();

        const original =
            Number(originalPrice);

        const discounted =
            Number(discountedPrice);

        const stock =
            Number(stockQuantity);

        if (!trimmedItemName) {
            toast.error(
                "Item name is required"
            );

            return;
        }

        if (!itemImage) {
            toast.error(
                "Food image is required"
            );

            return;
        }

        if (
            !Number.isFinite(original) ||
            original <= 0
        ) {
            toast.error(
                "Enter a valid original price"
            );

            return;
        }

        if (
            !Number.isFinite(discounted) ||
            discounted <= 0
        ) {
            toast.error(
                "Enter a valid discounted price"
            );

            return;
        }

        if (discounted >= original) {
            toast.error(
                "Discounted price must be lower than the original price"
            );

            return;
        }

        if (
            !Number.isInteger(stock) ||
            stock <= 0
        ) {
            toast.error(
                "Stock must be a positive whole number"
            );

            return;
        }

        await onSubmit({
            itemName: trimmedItemName,
            itemImage,
            unitType,
            originalPrice: original,
            discountedPrice: discounted,
            stockQuantity: stock,
        });

        setItemName("");
        setUnitType("full");
        setOriginalPrice("");
        setDiscountedPrice("");
        setStockQuantity("");
        setItemImage(null);
        setImagePreview(null);
    };

    return (
        <div className="space-y-5">
            <div>
                <label
                    htmlFor="itemName"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Food item name
                </label>

                <input
                    id="itemName"
                    type="text"
                    value={itemName}
                    onChange={(event) =>
                        setItemName(
                            event.target.value
                        )
                    }
                    placeholder="Chicken Biriyani"
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
            </div>

            <div>
                <label
                    htmlFor="itemImage"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Food image
                </label>

                <input
                    id="itemImage"
                    name="itemImage"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                    className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-green-100 file:px-4 file:py-2 file:font-medium file:text-green-800 hover:file:bg-green-200"
                />

                <p className="mt-2 text-xs text-gray-500">
                    JPG, PNG or WebP, maximum 5 MB.
                </p>

                {imagePreview && (
                    <div className="mt-4">
                        <img
                            src={imagePreview}
                            alt="Food preview"
                            className="h-40 w-full rounded-xl border border-gray-200 object-cover sm:w-64"
                        />
                    </div>
                )}
            </div>

            <div>
                <label
                    htmlFor="unitType"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Unit or variant
                </label>

                <select
                    id="unitType"
                    value={unitType}
                    onChange={(event) =>
                        setUnitType(
                            event.target
                                .value as MenuUnitType
                        )
                    }
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >
                    <option value="full">
                        Full
                    </option>

                    <option value="half">
                        Half
                    </option>

                    <option value="quarter">
                        Quarter
                    </option>

                    <option value="piece">
                        Piece
                    </option>

                    <option value="number">
                        Number
                    </option>
                </select>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
                <div>
                    <label
                        htmlFor="originalPrice"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Original price
                    </label>

                    <input
                        id="originalPrice"
                        type="number"
                        min="1"
                        step="0.01"
                        value={originalPrice}
                        onChange={(event) =>
                            setOriginalPrice(
                                event.target.value
                            )
                        }
                        disabled={isSubmitting}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                    />
                </div>

                <div>
                    <label
                        htmlFor="discountedPrice"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Discounted price
                    </label>

                    <input
                        id="discountedPrice"
                        type="number"
                        min="1"
                        step="0.01"
                        value={discountedPrice}
                        onChange={(event) =>
                            setDiscountedPrice(
                                event.target.value
                            )
                        }
                        disabled={isSubmitting}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                    />
                </div>

                <div>
                    <label
                        htmlFor="stockQuantity"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Stock
                    </label>

                    <input
                        id="stockQuantity"
                        type="number"
                        min="1"
                        step="1"
                        value={stockQuantity}
                        onChange={(event) =>
                            setStockQuantity(
                                event.target.value
                            )
                        }
                        disabled={isSubmitting}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                    />
                </div>
            </div>

            <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting
                    ? "Adding item..."
                    : "Add food item"}
            </button>
        </div>
    );
};

export default MenuItemForm;