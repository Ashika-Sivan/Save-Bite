import {
    useEffect,
    useState,
} from "react";
import { useNavigate, useParams } from
    "react-router-dom";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import {
    ArrowLeft,
    Loader2,
    Power,
    Copy
} from "lucide-react";
import { usePreviousMenu as applyPreviousMenuApi } from "../../services/menu.service";

import PickupWindowForm from
    "../../components/vendor/PickupWindowForm";
import MenuItemForm from
    "../../components/vendor/MenuItemForm";
import MenuItemCard from
    "../../components/vendor/MenuItemCard";
import EditMenuItemForm from
    "../../components/vendor/EditMenuItemForm";

import  {
    addDailyMenuItem,
    createDailyMenu,
    endLive,
    getTodayMenu,
    goLive,
    updateDailyMenuItem,
    updatePickupWindow,
    type AddDailyMenuItemData,
    type CreateDailyMenuData,
    type DailyMenu,
    type DailyMenuItem,
    type UpdateDailyMenuItemData,
} from "../../services/menu.service";


interface ErrorResponse {
    message?: string;
}

const getErrorMessage = (
    error: unknown,
    fallback: string
): string => {
    const axiosError =
        error as AxiosError<ErrorResponse>;

    return (
        axiosError.response?.data?.message ||
        fallback
    );
};

const formatDateTime = (
    value: string
): string => {
    return new Date(value).toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short",
        }
    );
};

const TodayMenu = () => {
    const navigate = useNavigate();
    const [isUsingPreviousMenu,setIsUsingPreviousMenu]=useState(false)

    const { hotelId } = useParams<{
        hotelId: string;
    }>();

    const [menu, setMenu] =
        useState<DailyMenu | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [isCreating, setIsCreating] =
        useState(false);

    const [isAddingItem, setIsAddingItem] =
        useState(false);

    const [
        isUpdatingWindow,
        setIsUpdatingWindow,
    ] = useState(false);
    const [editingItem, setEditingItem] =useState<DailyMenuItem | null>(null);
    

const [isUpdatingItem, setIsUpdatingItem] =useState(false);
    

    const [
        isChangingLiveStatus,
        setIsChangingLiveStatus,
    ] = useState(false);

    useEffect(() => {
        let ignore = false;
        const fetchTodayMenu = async () => {
            await Promise.resolve();
            if (!hotelId) {
                toast.error("Hotel ID is missing");
                navigate("/vendor/hotels");
                return;
            }

            try {
                setIsLoading(true);

                const response =
                    await getTodayMenu(hotelId);

                if (!ignore) {
                    setMenu(response.data);
                }
            } catch (error) {
                if (!ignore) {
                    toast.error(
                        getErrorMessage(
                            error,
                            "Unable to fetch today's menu"
                        )
                    );
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        };

        void fetchTodayMenu();
        return () => {
            ignore = true;
        };
    }, [hotelId, navigate]);

    const handleCreateMenu = async (
        data: CreateDailyMenuData
    ): Promise<void> => {
        if (!hotelId) return;

        try {
            setIsCreating(true);

            const response =
                await createDailyMenu(
                    hotelId,
                    data
                );

            setMenu(response.data);
            toast.success(response.message);
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    "Unable to create today's menu"
                )
            );
        } finally {
            setIsCreating(false);
        }
    };

    const handleAddItem = async (
        data: AddDailyMenuItemData
    ): Promise<void> => {
        if (!menu) return;

        try {
            setIsAddingItem(true);

            const response =
                await addDailyMenuItem(
                    menu.id,
                    data
                );

            setMenu(response.data);
            toast.success(response.message);
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    "Unable to add menu item"
                )
            );
        } finally {
            setIsAddingItem(false);
        }
    };

    const handleUpdateWindow = async (
        data: CreateDailyMenuData
    ): Promise<void> => {
        if (!menu) return;

        try {
            setIsUpdatingWindow(true);

            const response =
                await updatePickupWindow(
                    menu.id,
                    data
                );

            setMenu(response.data);
            toast.success(response.message);
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    "Unable to update pickup window"
                )
            );
        } finally {
            setIsUpdatingWindow(false);
        }
    };

    const handleUpdateMenuItem = async (data:UpdateDailyMenuItemData): Promise<void> => {

    if (!menu || !editingItem) {
        return;
    }

    try {
        setIsUpdatingItem(true);

        const response = await updateDailyMenuItem(
            menu.id,
            editingItem.id,
            data
        );

        setMenu(response.data);
        setEditingItem(null);

        toast.success(response.message);
    } catch (error) {
        toast.error(
            getErrorMessage(
                error,
                "Failed to update menu item"
            )
        );
    } finally {
        setIsUpdatingItem(false);
    }
};

    const handleLiveStatus = async () => {
        if (!menu) return;

        try {
            setIsChangingLiveStatus(true);

            const response = menu.isLive
                ? await endLive(menu.id)
                : await goLive(menu.id);

            setMenu(response.data);
            toast.success(response.message);
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    "Unable to change live status"
                )
            );
        } finally {
            setIsChangingLiveStatus(false);
        }
    };

    if (isLoading) {
        return (
            <main className="flex flex-1 items-center justify-center">
                <Loader2
                    size={34}
                    className="animate-spin text-green-700"
                />
            </main>
        );
    }



    const handleUsePreviousMenu=async():Promise<void>=>{
        if(!menu){
            return
        }
        try {
            setIsUsingPreviousMenu(true)
            const response=await applyPreviousMenuApi(menu.id)
            setMenu(response.data)
            toast.success(response.message);
            
        } catch (error) {
            toast.error(getErrorMessage(error,"unable to use the previous menu"))
        }finally{
            setIsUsingPreviousMenu(false)
        }
    }

    return (
        <main className="flex-1 p-5 md:p-8">
            <div className="mx-auto max-w-5xl">
                <button
                    type="button"
                    onClick={() =>
                        navigate("/vendor/hotels")
                    }
                    className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"
                >
                    <ArrowLeft size={18} />
                    Back to hotels
                </button>

                <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Today&apos;s Menu
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage today&apos;s food,
                            stock and pickup window.
                        </p>
                    </div>

                    {menu && (
                        <button
                            type="button"
                            onClick={() =>
                                void handleLiveStatus()
                            }
                            disabled={
                                isChangingLiveStatus
                            }
                            className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white disabled:opacity-60 ${
                                menu.isLive
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-green-700 hover:bg-green-800"
                            }`}
                        >
                            {isChangingLiveStatus ? (
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                            ) : (
                                <Power size={18} />
                            )}

                            {menu.isLive
                                ? "End Live"
                                : "Go Live"}
                        </button>
                    )}
                </div>

                {!menu ? (
                    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900">
                            Create today&apos;s menu
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Set the pickup window before
                            adding food items.
                        </p>

                        <div className="mt-5">
                            <PickupWindowForm
                                submitLabel="Create menu"
                                isSubmitting={
                                    isCreating
                                }
                                onSubmit={
                                    handleCreateMenu
                                }
                            />
                        </div>
                    </section>
                ) : (
                    <>
                        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Pickup window
                                    </h2>

                                    <p className="mt-2 text-sm text-gray-600">
                                        {formatDateTime(
                                            menu
                                                .pickupWindow
                                                .startTime
                                        )}
                                        {" — "}
                                        {formatDateTime(
                                            menu
                                                .pickupWindow
                                                .endTime
                                        )}
                                    </p>
                                </div>

                                <span
                                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                        menu.isLive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                                >
                                    {menu.isLive
                                        ? "Live"
                                        : "Offline"}
                                </span>
                            </div>

                            {!menu.isLive && (
                                <div className="mt-6 border-t border-gray-100 pt-6">
                                    <h3 className="mb-4 font-semibold text-gray-900">
                                        Update pickup
                                        window
                                    </h3>

                                    <PickupWindowForm
                                        initialStartTime={
                                            menu
                                                .pickupWindow
                                                .startTime
                                        }
                                        initialEndTime={
                                            menu
                                                .pickupWindow
                                                .endTime
                                        }
                                        submitLabel="Update pickup window"
                                        isSubmitting={
                                            isUpdatingWindow
                                        }
                                        onSubmit={
                                            handleUpdateWindow
                                        }
                                    />
                                </div>
                            )}
                        </section>

                        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900">
                                Add food item
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Add today&apos;s available
                                leftover food and stock.
                            </p>

                            {menu &&
    !menu.isLive &&
    menu.items.length === 0 && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h3 className="font-semibold text-gray-900">
                        Reuse your previous menu
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                        Copy names, images and prices
                        from this hotel&apos;s latest
                        menu. Today&apos;s stock will
                        start at zero.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        void handleUsePreviousMenu()
                    }
                    disabled={
                        isUsingPreviousMenu
                    }
                    className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-green-700 bg-white px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isUsingPreviousMenu ? (
                        <Loader2
                            size={18}
                            className="animate-spin"
                        />
                    ) : (
                        <Copy size={18} />
                    )}

                    {isUsingPreviousMenu
                        ? "Copying..."
                        : "Use Previous Menu"}
                </button>
            </div>
        </div>
    )}

                            <div className="mt-5">
                                <MenuItemForm
                                    isSubmitting={
                                        isAddingItem
                                    }
                                    onSubmit={
                                        handleAddItem
                                    }
                                />
                            </div>
                        </section>

                        <section className="mt-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Food items
                                </h2>

                                <span className="text-sm text-gray-500">
                                    {menu.items.length}{" "}
                                    item
                                    {menu.items.length ===
                                    1
                                        ? ""
                                        : "s"}
                                </span>
                            </div>

                            {editingItem && (
                                <div className="mb-5">
                                    <EditMenuItemForm
                                        item={editingItem}
                                        isSubmitting={
                                            isUpdatingItem
                                        }
                                        onSubmit={
                                            handleUpdateMenuItem
                                        }
                                        onCancel={() =>
                                            setEditingItem(null)
                                        }
                                    />
                                </div>
                            )}

                            {menu.items.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
                                    No food items added yet.
                                </div>
                            ) : (
                                <div className="grid gap-5 md:grid-cols-2">
                                    {menu.items.map(
                                        (item) => (
                                            <MenuItemCard
                                                key={
                                                    item.id
                                                }
                                                item={
                                                    item
                                                }
                                                onEdit={
                                                    setEditingItem
                                                }
                                            />
                                        )
                                    )}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </main>
    );
};

export default TodayMenu;