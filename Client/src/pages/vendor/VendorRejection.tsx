import {
  XCircle,
  ShieldX,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Info,
  RefreshCw,
  ArrowLeft,
  LifeBuoy,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkVendorStatus } from "../../services/vendor.service";
import { APP_ROUTES } from "../../constants/appRoutes";



export default function VendorRejected() {

  const navigate = useNavigate()
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const fetchVendorStatus = async () => {
      try {
        const response = await checkVendorStatus()
        console.log("vendor status:", response);
        setReason(
          response.data?.rejectionReason || "your vendor application was rejected."
        )

      } catch (error) {
        console.error("Failed to fetch rejection reason:", error);

        setReason("Unable to load the rejection reason.");

      } finally {
        setLoading(false)
      }
    }
    fetchVendorStatus()
  }, [])
  return (
    <div className="min-h-screen bg-[#faf7ef] text-slate-900 antialiased">
      {/* Header */}
      <header className="border-b border-slate-200/70 bg-[#faf7ef]/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#15803d] text-white shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2s7 4 7 10a7 7 0 0 1-14 0c0-6 7-10 7-10z" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Save<span className="text-[#15803d]">Bite</span>
            </span>
          </div>
          <span className="text-sm font-medium text-slate-500">Vendor Portal</span>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_10px_40px_-20px_rgba(15,23,42,0.15)] sm:p-10">
          {/* Illustration */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 -z-10 mx-auto h-40 w-40 rounded-full bg-red-500/10 blur-2xl" />
              <div className="relative flex h-40 w-40 items-center justify-center rounded-3xl bg-gradient-to-br from-red-50 to-rose-50 shadow-[0_10px_40px_-15px_rgba(220,38,38,0.35)]">
                <ShieldX className="h-20 w-20 text-red-500" strokeWidth={1.5} />
                <span className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-100">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </span>
                <span className="absolute -bottom-2 -left-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-100">
                  <FileText className="h-5 w-5 text-slate-500" />
                </span>
              </div>
            </div>

            {/* Badge */}
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-100">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Application Rejected
            </span>

            <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Your Vendor Application Was Not Approved
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-500">
              Unfortunately, we couldn't approve your vendor application at this
              time. Please review the rejection reason below, make the necessary
              corrections, and submit your application again.
            </p>
          </div>

          <section className="mt-10 rounded-2xl border border-red-200 bg-red-50/60 p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <h2 className="text-sm font-semibold text-red-800">
                Reason for Rejection
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-red-900/90">{loading ? "Loading rejection reason..." : reason}</p>
          </section>

          {/* Next steps */}
          <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 sm:p-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              What should you do next?
            </h2>
            <ul className="space-y-3">
              {[
                "Review the rejection reason",
                "Update incorrect business information",
                "Upload valid documents",
                "Submit your application again",
              ].map((step) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#15803d]/10">
                    <CheckCircle2 className="h-4 w-4 text-[#15803d]" />
                  </span>
                  <span className="text-sm leading-6 text-slate-700">{step}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Info card */}
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-sky-600" />
            <p className="text-sm leading-relaxed text-sky-900">
              If you believe this decision was made in error, you may contact{" "}
              <span className="font-medium">SaveBite Support</span> for assistance.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate(APP_ROUTES.VENDOR.REAPPLY)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#15803d] px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#166534] hover:shadow-md"
            >
              <RefreshCw className="h-4 w-4" />
              Apply Again
            </button>
            <button
              onClick={() => navigate(APP_ROUTES.PUBLIC.HOME)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/70">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:px-8">
          <p>© 2026 SaveBite. All rights reserved.</p>
          <a
            href="mailto:support@savebite.com"
            className="inline-flex items-center gap-1.5 font-medium text-[#15803d] transition-colors hover:text-[#166534]"
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            Need Help? Contact Support
          </a>
        </div>
      </footer>
    </div>
  );
}
