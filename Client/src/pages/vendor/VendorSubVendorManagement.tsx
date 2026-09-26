import { useEffect, useState } from "react";
import { Loader2, Settings, Building2, MapPin, ShieldCheck, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { getVendorHotels } from "../../services/hotel.service";
import { getSubVendor } from "../../services/vendor.service";
import type { Hotel } from "../../types/hotel.types";
import { SubVendorCredentialsModal } from "../../components/vendor/SubVendorCredentialsModal";

export const VendorSubVendorManagement = () => {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [subVendors, setSubVendors] = useState<Record<string, any | null>>({});

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const hotelsRes = await getVendorHotels();
            const hotelsData = hotelsRes.data;
            setHotels(hotelsData);

            const subVendorsMap: Record<string, any | null> = {};
            await Promise.all(
                hotelsData.map(async (hotel: Hotel) => {
                    try {
                        const sv = await getSubVendor(hotel._id);
                        subVendorsMap[hotel._id] = sv.data;
                    } catch (e) {
                        subVendorsMap[hotel._id] = null;
                    }
                })
            );
            setSubVendors(subVendorsMap);
        } catch (error) {
            toast.error("Failed to fetch hotels");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchData();
    }, []);

    const openModal = (hotel: Hotel) => {
        setSelectedHotel(hotel);
        setIsModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 size={34} className="animate-spin text-green-700" />
            </div>
        );
    }

    const totalPages = Math.ceil(hotels.length / itemsPerPage);
    const paginatedHotels = hotels.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Manage Access</h1>
                <p className="text-gray-500 mt-2">
                    Create credentials and assign specific permissions to your hotel branches.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {paginatedHotels.map((hotel) => {
                    const subVendor = subVendors[hotel._id];
                    const hasCredentials = !!subVendor;

                    return (
                        <div key={hotel._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Building2 className="text-green-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{hotel.hotelName}</h3>
                                        <div className="flex items-center text-sm text-gray-500 gap-1 mt-0.5">
                                            <MapPin size={14} />
                                            {hotel.place}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        {hasCredentials ? (
                                            <ShieldCheck size={18} className="text-green-600" />
                                        ) : (
                                            <ShieldAlert size={18} className="text-amber-500" />
                                        )}
                                        <span className="font-semibold text-gray-900 text-sm">
                                            Access Status
                                        </span>
                                    </div>
                                    
                                    {hasCredentials ? (
                                        <div>
                                            <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                Credentials Active
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {subVendor.permissions?.length > 0 ? (
                                                    subVendor.permissions.map((p: string) => (
                                                        <span key={p} className="px-2 py-1 bg-white border border-gray-200 text-xs font-medium text-gray-600 rounded-lg">
                                                            {p.replace(/_/g, " ")}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-500 italic">No permissions assigned</span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-amber-700 font-medium flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                            No Credentials Set
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => openModal(hotel)}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors"
                            >
                                <Settings size={18} />
                                {hasCredentials ? "Manage Roles & Permissions" : "Set Up Access"}
                            </button>
                        </div>
                    );
                })}
            </div>

            {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50 font-medium text-sm transition"
                    >
                        Previous
                    </button>
                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                                    currentPage === i + 1
                                        ? "bg-green-700 text-white"
                                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50 font-medium text-sm transition"
                    >
                        Next
                    </button>
                </div>
            )}

            {selectedHotel && (
                <SubVendorCredentialsModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedHotel(null);
                    }}
                    hotelId={selectedHotel._id}
                    hotelName={selectedHotel.hotelName}
                    existingSubVendor={subVendors[selectedHotel._id]}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
};
