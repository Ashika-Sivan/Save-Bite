import {
    useState,
    type FormEvent,
} from "react"

import toast from "react-hot-toast"
import { Clock, Calendar, ArrowRight, Info, AlertCircle, PlayCircle, StopCircle } from "lucide-react";

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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                {/* Decorative background element */}
                <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-green-50 opacity-50 blur-2xl"></div>
                
                <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
                    
                    {/* Start Time Container */}
                    <div className="relative flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700">
                                <PlayCircle size={14} />
                            </div>
                            <label htmlFor="pickupStartTime" className="text-sm font-bold text-gray-800">
                                Food available from
                            </label>
                        </div>
                        
                        <div className="group relative">
                            <input
                                id="pickupStartTime"
                                type="datetime-local"
                                value={startTime}
                                onChange={(event) => setStartTime(event.target.value)}
                                disabled={isSubmitting}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 pl-11 text-gray-900 outline-none transition-all focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-50 disabled:opacity-60"
                            />
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-green-600" size={18} />
                        </div>
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                            <Info size={12} className="text-gray-400" />
                            The vendor can go live from this time.
                        </p>
                    </div>

                    {/* Separator / Visual Timeline */}
                    <div className="hidden shrink-0 flex-col items-center justify-center px-2 pt-6 md:flex">
                        <div className="h-0.5 w-12 border-t-2 border-dashed border-gray-300"></div>
                        <div className="absolute rounded-full border border-gray-200 bg-white p-1.5 text-gray-400 shadow-sm">
                            <ArrowRight size={16} />
                        </div>
                    </div>

                    {/* End Time Container */}
                    <div className="relative flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600">
                                <StopCircle size={14} />
                            </div>
                            <label htmlFor="pickupEndTime" className="text-sm font-bold text-gray-800">
                                Pickup closes at
                            </label>
                        </div>
                        
                        <div className="group relative">
                            <input
                                id="pickupEndTime"
                                type="datetime-local"
                                value={endTime}
                                onChange={(event) => setEndTime(event.target.value)}
                                disabled={isSubmitting}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 pl-11 text-gray-900 outline-none transition-all focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-50 disabled:opacity-60"
                            />
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-red-500" size={18} />
                        </div>
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                            <Info size={12} className="text-gray-400" />
                            Customers cannot collect food after this time.
                        </p>
                    </div>

                </div>
            </div>

            {orderCutoffTime && endDate && (
                <div className="overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50/30 p-5">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200/50 text-green-700">
                            <AlertCircle size={18} />
                        </div>
                        <h4 className="font-bold text-green-900">Timeline Summary</h4>
                    </div>
                    
                    <div className="relative grid gap-6 sm:grid-cols-2">
                        {/* Connecting line */}
                        <div className="absolute bottom-0 left-1/2 top-4 hidden w-px -translate-x-1/2 bg-green-200 sm:block"></div>
                        
                        <div className="relative z-10 rounded-xl border border-green-100 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
                            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-green-600/80">
                                New orders close at
                            </p>
                            <p className="text-xl font-black text-amber-600">
                                {formatTime(orderCutoffTime)}
                            </p>
                        </div>

                        <div className="relative z-10 rounded-xl border border-green-100 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
                            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-green-600/80">
                                Customer pickup
                            </p>
                            <p className="text-sm font-semibold leading-tight text-green-800">
                                After payment, <br/> before <span className="text-lg font-black">{formatTime(endDate)}</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-green-700 px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-green-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
                {isSubmitting ? "Saving changes..." : submitLabel}
            </button>
        </form>
    )
}

export default PickupWindowForm