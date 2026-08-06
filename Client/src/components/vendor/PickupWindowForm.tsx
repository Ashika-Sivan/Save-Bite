import {
    useEffect,
    useState,
    type FormEvent,
} from "react";
import toast from "react-hot-toast";

import type { CreateDailyMenuData } from "../../services/menu.service";

interface PickupWindowFormProps {
    initialStartTime?: string;
    initialEndTime?: string;
    submitLabel: string;
    isSubmitting: boolean;

    onSubmit: (
        data: CreateDailyMenuData
    ) => Promise<void>;
}

/*
 * Converts an ISO date from the backend into the
 * format required by an HTML datetime-local input.
 */
const toDateTimeLocal = (
    value?: string
): string => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const timezoneOffset =
        date.getTimezoneOffset() * 60 * 1000;

    return new Date(
        date.getTime() - timezoneOffset
    )
        .toISOString()
        .slice(0, 16);
};

const PickupWindowForm = ({
    initialStartTime,
    initialEndTime,
    submitLabel,
    isSubmitting,
    onSubmit,
}: PickupWindowFormProps) => {
    const [startTime, setStartTime] =
        useState("");

    const [endTime, setEndTime] =
        useState("");

    useEffect(() => {
        setStartTime(
            toDateTimeLocal(initialStartTime)
        );

        setEndTime(
            toDateTimeLocal(initialEndTime)
        );
    }, [initialStartTime, initialEndTime]);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!startTime || !endTime) {
            toast.error(
                "Please select both pickup times"
            );
            return;
        }

        const startDate = new Date(startTime);
        const endDate = new Date(endTime);

        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime())
        ) {
            toast.error("Invalid pickup time");
            return;
        }

        if (startDate >= endDate) {
            toast.error(
                "Pickup end time must be after the start time"
            );
            return;
        }

        await onSubmit({
            pickupStartTime:
                startDate.toISOString(),

            pickupEndTime:
                endDate.toISOString(),
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >
            <div className="grid gap-5 md:grid-cols-2">
                <div>
                    <label
                        htmlFor="pickupStartTime"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Pickup start time
                    </label>

                    <input
                        id="pickupStartTime"
                        type="datetime-local"
                        value={startTime}
                        onChange={(event) =>
                            setStartTime(
                                event.target.value
                            )
                        }
                        disabled={isSubmitting}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />
                </div>

                <div>
                    <label
                        htmlFor="pickupEndTime"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Pickup end time
                    </label>

                    <input
                        id="pickupEndTime"
                        type="datetime-local"
                        value={endTime}
                        onChange={(event) =>
                            setEndTime(
                                event.target.value
                            )
                        }
                        disabled={isSubmitting}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
            >
                {isSubmitting
                    ? "Saving..."
                    : submitLabel}
            </button>
        </form>
    );
};

export default PickupWindowForm;