import { useEffect, useState, useCallback } from "react";
import {
  getAdminConcerns,
  approveAdminConcern,
  rejectAdminConcern,
  type ConcernItem,
} from "../../services/concern.service";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface ErrorResponse {
  message?: string;
}

type FilterStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

const AdminConcerns = () => {
  const [concerns, setConcerns] = useState<ConcernItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [selectedConcern, setSelectedConcern] = useState<ConcernItem | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchConcerns = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getAdminConcerns(statusFilter);
      setConcerns(res.data?.concerns || []);
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || "Failed to load concerns");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const loadData = async () => {
      await fetchConcerns();
    };
    loadData();
  }, [fetchConcerns]);

  const handleApprove = async () => {
    if (!selectedConcern) return;
    try {
      setIsProcessing(true);
      await approveAdminConcern(selectedConcern._id, adminNote);
      toast.success("Concern approved! 100% refund issued and order marked as resolved.");
      setSelectedConcern(null);
      setAdminNote("");
      await fetchConcerns();
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || "Failed to approve concern");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedConcern) return;
    try {
      setIsProcessing(true);
      await rejectAdminConcern(selectedConcern._id, adminNote);
      toast.success("Concern rejected. Order reverted to 'placed' status.");
      setSelectedConcern(null);
      setAdminNote("");
      await fetchConcerns();
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || "Failed to reject concern");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDateTime = (dateStr?: string | null): string => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }) + " IST";
  };

  const getPhotoUrl = (url?: string): string => {
    if (!url) return "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80";
    let cleanUrl = url;
    if (cleanUrl.includes("savebite-bucket")) {
      cleanUrl = cleanUrl.replace("savebite-bucket", "savebite-storage-ashika");
    }
    if (!cleanUrl.startsWith("http")) {
      const base = import.meta.env.VITE_IMAGE_BASE_URL || "https://savebite-storage-ashika.s3.ap-south-1.amazonaws.com";
      cleanUrl = `${base.replace(/\/$/, "")}/${cleanUrl}`;
    }
    return cleanUrl;
  };

  const renderExifBadge = (concern: ConcernItem) => {
    if (concern.isTimestampValid === true) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-300">
          ✅ EXIF Validated
        </span>
      );
    }
    if (concern.isTimestampValid === false) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 border border-rose-300">
          ⚠️ Outside Pickup Window
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-300">
        ❓ EXIF Metadata Missing
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Concerns & Disputes</h1>
            <p className="mt-1 text-sm text-gray-500">
              Review customer photo evidence, EXIF metadata capture timestamps, and process refunds.
            </p>
          </div>

        
          <div className="flex items-center gap-2 rounded-2xl bg-white p-1.5 shadow-sm border border-gray-200">
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as FilterStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                  statusFilter === st
                    ? "bg-emerald-700 text-white shadow"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

   
        {isLoading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
          </div>
        ) : concerns.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-500 font-medium">No order concerns found in '{statusFilter}' status.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {concerns.map((c) => {
              const orderIdStr =
                typeof c.orderId === "object" ? c.orderId._id : c.orderId;
              const shortOrderId = `ORD-${orderIdStr.slice(-5).toUpperCase()}`;
              const photoUrl = getPhotoUrl(c.photoUrl);

              return (
                <div
                  key={c._id}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-gray-200 hover:-translate-y-1"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{shortOrderId}</span>
                        {renderExifBadge(c)}
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          c.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : c.status === "rejected"
                            ? "bg-rose-50 text-rose-700 border border-rose-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                   
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-900">{c.customerId?.name || "Unknown Customer"}</p>
                      <p className="text-xs text-gray-500">{c.customerId?.email}</p>
                    </div>

                 
                    <div className="relative overflow-hidden rounded-2xl bg-gray-50 aspect-video">
                      <img
                        src={photoUrl}
                        alt="Evidence"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <a
                        href={photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-3 right-3 translate-y-4 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white group-hover:translate-y-0 group-hover:opacity-100"
                      >
                        View Full Image ↗
                      </a>
                    </div>

                    
                    <div className="mt-4 space-y-2 rounded-xl bg-gray-50/80 p-3 text-[11px] text-gray-600 border border-gray-100">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-medium whitespace-nowrap">Capture Time:</span>
                        <span className="font-semibold text-gray-900 text-right">
                          {c.photoCapturedAt ? formatDateTime(c.photoCapturedAt) : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-medium whitespace-nowrap">Pickup Window:</span>
                        <span className="font-semibold text-gray-900 text-right">
                          {formatDateTime(c.pickupWindowStart)} — {formatDateTime(c.pickupWindowEnd)}
                        </span>
                      </div>
                    </div>

                
                    <div className="mt-5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Concern Details</h4>
                      <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        "{c.reason}"
                      </p>
                    </div>

                  
                    {c.adminNote && (
                      <div className="mt-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Admin Note</h4>
                        <p className="text-sm text-gray-600 italic">
                          {c.adminNote}
                        </p>
                      </div>
                    )}
                  </div>

             
                  {c.status === "pending" && (
                    <div className="p-4 pt-0">
                      <button
                        type="button"
                        onClick={() => setSelectedConcern(c)}
                        className="w-full rounded-2xl bg-gray-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                      >
                        Review & Take Action
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Decision Modal */}
        {selectedConcern && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-900">Review Concern Decision</h3>
                <button
                  type="button"
                  onClick={() => setSelectedConcern(null)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-gray-50 p-4 border border-gray-200">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Customer: {selectedConcern.customerId?.name}</span>
                    <span>{renderExifBadge(selectedConcern)}</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-700">
                    <span className="font-bold">Reason: </span>"{selectedConcern.reason}"
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Admin Decision Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Enter reason for approval or rejection..."
                    className="mt-1 w-full rounded-2xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="rounded-full border border-rose-300 bg-rose-50 px-5 py-2 text-sm font-semibold text-rose-800 transition hover:bg-rose-100 disabled:opacity-50"
                  >
                    {isProcessing ? "Processing..." : "Reject Concern (Revert to Placed)"}
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                  >
                    {isProcessing ? "Processing..." : "Approve & Issue 100% Refund"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminConcerns;
