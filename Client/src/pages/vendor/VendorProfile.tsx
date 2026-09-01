import { useEffect, useState } from "react";
import { getVendorProfiles } from "../../services/vendor.service";
import { getVendorHotels } from "../../services/hotel.service";
import type { VendorDetailsType } from "../../types/vendor.types";
import type { Hotel } from "../../types/hotel.types";
import { Building2, MapPin, Receipt, CreditCard, Landmark, CheckCircle, Clock, XCircle, Info, FileText } from "lucide-react";

const fallbackRestaurantImage = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800";

const getImageUrl = (imageKey?: string): string => {
    if (!imageKey) return fallbackRestaurantImage;
    if (/^https?:\/\//i.test(imageKey)) return imageKey;
    const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;
    return imageBaseUrl
        ? `${imageBaseUrl.replace(/\/$/, "")}/${imageKey}`
        : fallbackRestaurantImage;
};

export default function VendorProfile() {
    const [mainProfile, setMainProfile] = useState<VendorDetailsType | null>(null);
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileData, hotelData] = await Promise.all([
                    getVendorProfiles(),
                    getVendorHotels()
                ]);

                // Set main vendor profile (the one with certificates)
                if (profileData?.data && Array.isArray(profileData.data) && profileData.data.length > 0) {
                    setMainProfile(profileData.data[0]);
                } else if (Array.isArray(profileData) && profileData.length > 0) {
                    setMainProfile(profileData[0]);
                }

                // Set hotels (other branches/businesses)
                if (hotelData?.success && Array.isArray(hotelData.data)) {
                    setHotels(hotelData.data);
                }
            } catch (error) {
                console.error("Failed to fetch vendor data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-700" />
                    <p className="font-medium text-gray-500">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!mainProfile) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-gray-100 p-6">
                    <Building2 size={48} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">No Main Business Found</h2>
                <p className="text-gray-500">We couldn't find your primary vendor registration.</p>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "approved":
                return (
                    <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                        <CheckCircle size={16} /> Approved
                    </span>
                );
            case "rejected":
                return (
                    <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                        <XCircle size={16} /> Rejected
                    </span>
                );
            case "pending":
            default:
                return (
                    <span className="flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                        <Clock size={16} /> Pending Review
                    </span>
                );
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#faf7ef]">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-5 md:px-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Vendor Profile
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your primary business and view other locations.
                    </p>
                </div>
            </header>

            <div className="flex-1 p-6 md:p-8">
                <div className="mx-auto max-w-5xl space-y-8">
                    
                    {/* Main Profile Section */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">Primary Business (Registered Entity)</h2>
                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
                            {/* Card Header */}
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/50 p-6 md:p-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-20 w-20 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                        <img
                                            src={getImageUrl(mainProfile.businessInfo?.businessImageKey)}
                                            alt={mainProfile.businessInfo?.businessName || "Business"}
                                            className="h-full w-full object-cover"
                                            onError={(e) => { e.currentTarget.src = fallbackRestaurantImage; }}
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {mainProfile.businessInfo?.businessName || "Unnamed Business"}
                                        </h2>
                                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold uppercase text-gray-600">
                                                {mainProfile.businessInfo?.businessType}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <MapPin size={14} /> {mainProfile.businessInfo?.place}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div>{getStatusBadge(mainProfile.status)}</div>
                            </div>

                            {/* Card Body */}
                            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 md:p-8">
                                
                                {/* Business Details */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4 border-b pb-2">
                                            <Info size={18} className="text-green-700" />
                                            Business Details
                                        </h3>
                                        <div className="space-y-4 text-sm">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Full Address</p>
                                                <p className="text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100">{mainProfile.businessInfo?.address || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4 border-b pb-2 mt-8">
                                            <Landmark size={18} className="text-green-700" />
                                            Banking Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Account Number</p>
                                                <p className="text-gray-800 font-medium">{mainProfile.verification?.bankAccountNumber || "N/A"}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">IFSC Code</p>
                                                <p className="text-gray-800 font-medium">{mainProfile.verification?.ifscCode || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Verification Details */}
                                <div>
                                    <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4 border-b pb-2">
                                        <FileText size={18} className="text-green-700" />
                                        Legal & Tax Details
                                    </h3>
                                    <div className="space-y-4 text-sm">
                                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                                                <Receipt size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">GST Number</p>
                                                <p className="text-gray-900 font-bold">{mainProfile.verification?.gstNumber || "N/A"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                                                <CreditCard size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">PAN Number</p>
                                                <p className="text-gray-900 font-bold">{mainProfile.verification?.panNumber || "N/A"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">FSSAI Number</p>
                                                <p className="text-gray-900 font-bold">{mainProfile.verification?.fssaiNumber || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Other Businesses / Hotels Section */}
                    {hotels.length > 0 && (
                        <div className="pt-4">
                            <div className="mb-4 flex items-center justify-between px-2">
                                <h2 className="text-xl font-bold text-gray-900">Other Businesses / Branches</h2>
                                <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700">{hotels.length} Total</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {hotels.map(hotel => (
                                    <div key={hotel._id} className="flex gap-4 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                                            <img
                                                src={hotel.hotelImageUrl}
                                                alt={hotel.hotelName}
                                                className="h-full w-full object-cover"
                                                onError={(e) => { e.currentTarget.src = fallbackRestaurantImage; }}
                                            />
                                        </div>
                                        <div className="flex flex-col justify-center overflow-hidden">
                                            <h3 className="truncate text-lg font-bold text-gray-900" title={hotel.hotelName}>
                                                {hotel.hotelName}
                                            </h3>
                                            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-gray-500">
                                                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold uppercase text-gray-600">
                                                    {hotel.businessType}
                                                </span>
                                            </p>
                                            <p className="mt-2 flex items-start gap-1 text-xs text-gray-500 line-clamp-2" title={hotel.address}>
                                                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                                                {hotel.address}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
