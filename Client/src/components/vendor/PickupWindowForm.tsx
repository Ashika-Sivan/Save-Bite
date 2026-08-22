import {
    useState,
    type FormEvent,
} from "react"

import toast from "react-hot-toast"

import type {
    CreateDailyMenuData,
} from "../../services/menu.service"

interface PickupWindowFormProps {
    initialStartTime?: string
    initialEndTime?: string
    submitLabel: string
    isSubmitting: boolean

    onSubmit: (
        data: CreateDailyMenuData
    ) => Promise<void>
}

/*
 * Converts an ISO date from the backend
 * into the format required by an HTML
 * datetime-local input.
 */
const toDateTimeLocal = (
    value?: string
): string => {
    if (!value) {
        return ""
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return ""
    }

    const timezoneOffset =
        date.getTimezoneOffset() *
        60 *
        1000

    return new Date(
        date.getTime() - timezoneOffset
    )
        .toISOString()
        .slice(0, 16)
}

const formatTime = (
    date: Date
): string => {
    return new Intl.DateTimeFormat(
        "en-IN",
        {
            hour: "numeric",
            minute: "2-digit",
        }
    ).format(date)
}

const PickupWindowForm = ({
    initialStartTime,
    initialEndTime,
    submitLabel,
    isSubmitting,
    onSubmit,
}: PickupWindowFormProps) => {
    const [startTime, setStartTime] =
        useState(() => toDateTimeLocal(initialStartTime))

    const [endTime, setEndTime] =
        useState(() => toDateTimeLocal(initialEndTime))

    const [prevInitial, setPrevInitial] = useState({
        initialStartTime,
        initialEndTime,
    })

    if (
        prevInitial.initialStartTime !== initialStartTime ||
        prevInitial.initialEndTime !== initialEndTime
    ) {
        setPrevInitial({ initialStartTime, initialEndTime })
        setStartTime(toDateTimeLocal(initialStartTime))
        setEndTime(toDateTimeLocal(initialEndTime))
    }

    const endDate = endTime
        ? new Date(endTime)
        : null

    const orderCutoffTime =
        endDate &&
        !Number.isNaN(endDate.getTime())
            ? new Date(
                  endDate.getTime() -
                      30 * 60 * 1000
              )
            : null

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        if (!startTime || !endTime) {
            toast.error(
                "Please select both times"
            )
            return
        }

        const startDate =
            new Date(startTime)

        const selectedEndDate =
            new Date(endTime)

        if (
            Number.isNaN(
                startDate.getTime()
            ) ||
            Number.isNaN(
                selectedEndDate.getTime()
            )
        ) {
            toast.error(
                "Invalid date or time"
            )
            return
        }

        if (
            startDate >=
            selectedEndDate
        ) {
            toast.error(
                "Pickup closing time must be after the food availability time"
            )
            return
        }

        const cutoffTime = new Date(
            selectedEndDate.getTime() -
                30 * 60 * 1000
        )

        if (startDate >= cutoffTime) {
            toast.error(
                "Food availability time must be before the order cutoff time"
            )
            return
        }

        if (new Date() >= cutoffTime) {
            toast.error(
                "Pickup closing time must be more than 30 minutes from now"
            )
            return
        }

        await onSubmit({
            pickupStartTime:
                startDate.toISOString(),

            pickupEndTime:
                selectedEndDate
                    .toISOString(),
        })
    }

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
                        Food available from
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

                    <p className="mt-2 text-xs text-gray-500">
                        The vendor can go live
                        from this time.
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="pickupEndTime"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Pickup closes at
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

                    <p className="mt-2 text-xs text-gray-500">
                        Customers cannot collect
                        food after this time.
                    </p>
                </div>
            </div>

            {orderCutoffTime &&
                endDate && (
                    <div className="grid gap-3 rounded-xl border border-green-200 bg-green-50 p-4 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                New orders close at
                            </p>

                            <p className="mt-1 font-bold text-orange-700">
                                {formatTime(
                                    orderCutoffTime
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                Customer pickup
                            </p>

                            <p className="mt-1 font-semibold text-green-800">
                                After payment,
                                before{" "}
                                {formatTime(
                                    endDate
                                )}
                            </p>
                        </div>
                    </div>
                )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting
                    ? "Saving..."
                    : submitLabel}
            </button>
        </form>
    )
}

export default PickupWindowForm