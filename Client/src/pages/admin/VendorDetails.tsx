
import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileText,
  Landmark,
  MapPin,
  RotateCw,
  ShieldCheck,
  X,
  XCircle,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import {
  getVendorById,
  approveVendor,
  rejectVendor,
} from "../../services/admin.service";
import type {
  VendorDetailsType,
  DocumentUrlsType,
} from "../../types/vendor.types";

type VendorStatus = "pending" | "approved" | "rejected";

const statusStyles: Record<VendorStatus, string> = {
  approved: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-100 text-amber-700 ring-amber-200",
  rejected: "bg-rose-100 text-rose-700 ring-rose-200",
};

const StatusPill = ({ status }: { status: string }) => {
  const key = (status as VendorStatus) in statusStyles ? (status as VendorStatus) : "pending";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyles[key]}`}
    >
      {status}
    </span>
  );
};

const Section = ({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) => (
  <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
    <div className="mb-5 flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
        {icon}
      </div>
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
    </div>
    {children}
  </section>
);

const Field = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 text-sm font-medium text-gray-900 break-words">{value || "—"}</p>
  </div>
);

const DocButton = ({
  onClick,
  label,
  disabled,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`group flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 transition hover:border-emerald-300 hover:bg-emerald-50 ${
      disabled ? "pointer-events-none opacity-50" : ""
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-700 ring-1 ring-emerald-100">
        <FileText size={16} />
      </div>
      <span className="text-sm font-medium text-gray-800">{label}</span>
    </div>
    <div className="flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-2xs group-hover:border-emerald-200">
      <Eye size={14} />
      View Certificate
    </div>
  </button>
);

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url?: string;
}

const FileViewerModal = ({ isOpen, onClose, title, url }: FileViewerModalProps) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isImgLoading, setIsImgLoading] = useState(true);
  const [isImgError, setIsImgError] = useState(false);

  const [prevUrl, setPrevUrl] = useState(url);
  if (prevUrl !== url) {
    setPrevUrl(url);
    setScale(1);
    setRotation(0);
    setIsImgLoading(true);
    setIsImgError(false);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !url) return null;

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md transition-opacity">
      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-gray-800 bg-gray-900 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-100">{title}</h3>
              <p className="text-xs text-gray-400">Built-in Certificate Viewer</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:bg-gray-700 hover:text-white"
            >
              <ExternalLink size={14} />
              Open Original
            </a>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-800 text-gray-400 transition hover:bg-rose-500/20 hover:text-rose-400"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="relative flex flex-1 items-center justify-center overflow-auto bg-gray-900/50 p-6">
          {isImgLoading && !isImgError && (
            <div className="absolute flex flex-col items-center gap-3 text-gray-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              <span className="text-xs font-medium">Loading document preview...</span>
            </div>
          )}

          {isImgError ? (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <p className="text-sm text-gray-400">Unable to display direct image preview.</p>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                Open document file in new tab
              </a>
            </div>
          ) : (
            <img
              src={url}
              alt={title}
              onLoad={() => setIsImgLoading(false)}
              onError={() => {
                setIsImgLoading(false);
                setIsImgError(true);
              }}
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transition: "transform 0.2s ease-out",
              }}
              className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
            />
          )}
        </div>

        {/* Floating Controls Bar */}
        <div className="flex items-center justify-between border-t border-gray-800 bg-gray-950 px-6 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-gray-300 transition hover:bg-gray-700 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="min-w-[50px] text-center font-mono text-xs text-gray-400">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-gray-300 transition hover:bg-gray-700 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={handleRotate}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-gray-300 transition hover:bg-gray-700 hover:text-white"
              title="Rotate 90°"
            >
              <RotateCw size={16} />
            </button>
          </div>

          <div className="text-xs text-gray-500">
            Press <kbd className="rounded bg-gray-800 px-1.5 py-0.5 font-mono text-[10px] text-gray-300">Esc</kbd> to close viewer
          </div>
        </div>
      </div>
    </div>
  );
};

const VendorDetails = () => {
  const { vendorId } = useParams();

  const [vendor, setVendor] = useState<VendorDetailsType | null>(null);
  const [documentUrls, setDocumentUrls] = useState<DocumentUrlsType | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<{ title: string; url?: string }>({
    title: "",
    url: "",
  });

  const openDocument = (title: string, url?: string) => {
    setActiveDoc({ title, url });
    setViewerOpen(true);
  };

useEffect(() => {
  const fetchVendor = async () => {
    if (!vendorId) {
      setError("Vendor id is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getVendorById(vendorId);

      console.log("Vendor response:", response);

      setVendor(response.data.vendor);
      setDocumentUrls(response.data.documentUrls);
    } catch (error) {
      console.error("Failed to fetch vendor:", error);
      setError("Failed to fetch vendor details");
    } finally {
      setLoading(false);
    }
  };

  fetchVendor();
}, [vendorId]);

  const handleApprove = async () => {
    if (!vendorId) return;
    try {
      await approveVendor(vendorId);
      setVendor((prev) => (prev ? { ...prev, status: "approved" } : prev));
      alert("Vendor approved successfully");
    } catch (err) {
      console.error("Failed to approve vendor", err);
      alert("Failed to approve vendor");
    }
  };

  const handleReject = async () => {
    if (!vendorId) return;
    if (!reason.trim()) {
      alert("Please enter rejection reason");
      return;
    }
    try {
      await rejectVendor(vendorId, reason.trim());
      setVendor((prev) => (prev ? { ...prev, status: "rejected" } : prev));
      alert("Vendor rejected successfully");
    } catch (err) {
      console.error("Failed to reject vendor", err);
      alert("Failed to reject vendor");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50/40">
        <p className="text-sm text-gray-500">Loading vendor…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50/40 px-4">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700">
          {error}
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50/40">
        <p className="text-sm text-gray-500">Vendor not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50/40 pb-16">
      {/* Header */}
      <div className="border-b border-emerald-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <button
            onClick={() => window.history.back()}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            <ArrowLeft size={16} />
            Back to vendors
          </button>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                <Building2 size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  {vendor.businessInfo.businessName}
                </h1>
                <p className="mt-0.5 text-sm text-gray-500">
                  {vendor.businessInfo.businessType} · {vendor.businessInfo.place}
                </p>
              </div>
            </div>
            <StatusPill status={vendor.status} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-6 px-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section icon={<MapPin size={16} />} title="Business Information">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Business Type" value={vendor.businessInfo.businessType} />
              <Field label="Place" value={vendor.businessInfo.place} />
              <div className="sm:col-span-2">
                <Field label="Address" value={vendor.businessInfo.address} />
              </div>
            </div>
          </Section>

          <Section icon={<ShieldCheck size={16} />} title="Verification Details">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="GST Number" value={vendor.verification.gstNumber} />
              <Field label="PAN Number" value={vendor.verification.panNumber} />
              <Field label="FSSAI Number" value={vendor.verification.fssaiNumber} />
              <Field label="IFSC Code" value={vendor.verification.ifscCode} />
              <div className="sm:col-span-2">
                <Field label="Bank Account Number" value={vendor.verification.bankAccountNumber} />
              </div>
            </div>
          </Section>

          <Section icon={<FileText size={16} />} title="Documents">
            {documentUrls ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DocButton
                  onClick={() => openDocument("GST Certificate", documentUrls.gstCertificateUrl)}
                  label="GST Certificate"
                  disabled={!documentUrls.gstCertificateUrl}
                />
                <DocButton
                  onClick={() => openDocument("FSSAI Certificate", documentUrls.fssaiCertificateUrl)}
                  label="FSSAI Certificate"
                  disabled={!documentUrls.fssaiCertificateUrl}
                />
                <DocButton
                  onClick={() => openDocument("PAN Card", documentUrls.panCardUrl)}
                  label="PAN Card"
                  disabled={!documentUrls.panCardUrl}
                />
                <DocButton
                  onClick={() =>
                    openDocument(
                      "Registration Certificate",
                      documentUrls.registrationCertificateUrl
                    )
                  }
                  label="Registration Certificate"
                  disabled={!documentUrls.registrationCertificateUrl}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500">No documents uploaded.</p>
            )}
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Section icon={<Landmark size={16} />} title="Status">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Current status</p>
              <StatusPill status={vendor.status} />
            </div>
          </Section>

          {vendor.status === "pending" && (
            <Section icon={<CheckCircle2 size={16} />} title="Review Action">
              <button
                onClick={handleApprove}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <CheckCircle2 size={16} />
                Approve Vendor
              </button>

              <div className="mt-6">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Rejection reason
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this vendor is being rejected…"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-emerald-100 bg-white p-3 text-sm text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                <button
                  onClick={handleReject}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  <XCircle size={16} />
                  Reject Vendor
                </button>
              </div>
            </Section>
          )}
        </div>
      </div>

      <FileViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        title={activeDoc.title}
        url={activeDoc.url}
      />
    </div>
  );
};

export default VendorDetails;
