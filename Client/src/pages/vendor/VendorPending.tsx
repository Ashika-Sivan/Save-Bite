import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Clock3,
  Circle,
  ShieldCheck,
  FileSearch,
  Mail,
} from "lucide-react";

export default function VendorPending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#faf7ef] p-6">
      <div className="mx-auto flex min-h-[95vh] max-w-7xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">

        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex items-center justify-between px-8 py-5">
            <div
              onClick={() => navigate("/")}
              className="flex cursor-pointer items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-white">
                🍃
              </div>

              <h1 className="text-2xl font-bold text-green-700">
                SaveBite
              </h1>
            </div>

            <span className="text-sm font-medium text-gray-500">
              Vendor Portal
            </span>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 px-6 py-14">

          <div className="mx-auto max-w-3xl text-center">

            {/* Illustration */}
            <div className="relative mx-auto mb-8 flex h-40 w-40 items-center justify-center rounded-3xl bg-green-50 shadow-inner">

              <FileSearch
                size={72}
                className="text-green-600"
              />

              <div className="absolute -right-2 -top-2 rounded-full bg-white p-2 shadow">
                <ShieldCheck
                  size={18}
                  className="text-green-600"
                />
              </div>

              <div className="absolute -bottom-2 -left-2 rounded-full bg-white p-2 shadow">
                <Clock3
                  size={18}
                  className="text-orange-500"
                />
              </div>
            </div>

            <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700">
              In Review
            </span>

            <h1 className="mt-6 text-5xl font-bold text-gray-900">
              Your Vendor Application
              <br />
              is Under Review
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Thank you for applying to become a SaveBite partner.
              Our team is currently reviewing your submitted
              business information and uploaded documents.
              This process usually takes
              <span className="font-semibold">
                {" "}
                1–3 business days.
              </span>
            </p>

            {/* Progress Card */}

            <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-8 text-left shadow-sm">

              <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Application Progress
              </h2>

              <div className="space-y-6">

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">

                    <CheckCircle
                      className="text-green-600"
                      size={28}
                    />

                    <div>
                      <h3 className="font-semibold">
                        Application Submitted
                      </h3>

                      <p className="text-sm text-gray-500">
                        Your application has been received.
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                    Completed
                  </span>
                </div>

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-4">

                    <Clock3
                      className="text-orange-500"
                      size={28}
                    />

                    <div>
                      <h3 className="font-semibold">
                        Documents Under Verification
                      </h3>

                      <p className="text-sm text-gray-500">
                        Our team is reviewing your uploaded files.
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
                    In Progress
                  </span>
                </div>

                <div className="flex items-center gap-4">

                  <Circle
                    className="text-gray-300"
                    size={28}
                  />

                  <div>
                    <h3 className="font-semibold text-gray-400">
                      Approval Pending
                    </h3>

                    <p className="text-sm text-gray-400">
                      Waiting for final review by the SaveBite
                      team.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Info Card */}

            <div className="mt-8 flex items-start gap-4 rounded-2xl border border-green-200 bg-green-50 p-6 text-left">

              <Mail
                className="mt-1 text-green-700"
                size={24}
              />

              <div>
                <h3 className="font-semibold text-green-800">
                  We'll keep you updated
                </h3>

                <p className="mt-1 text-sm leading-7 text-gray-700">
                  We'll notify you by email once your application
                  has been approved or if additional information
                  is required.
                </p>
              </div>
            </div>

            {/* Buttons */}

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">

              <button
                disabled
                className="cursor-not-allowed rounded-full bg-gray-300 px-8 py-3 font-semibold text-white"
              >
                Waiting for Approval
              </button>

              <button
                onClick={() => navigate("/")}
                className="rounded-full border border-green-700 px-8 py-3 font-semibold text-green-700 transition hover:bg-green-700 hover:text-white"
              >
                Back to Home
              </button>

            </div>

          </div>

        </main>

        {/* Footer */}

        <footer className="border-t border-gray-200 bg-gray-50">
          <div className="mx-auto flex flex-col items-center justify-between gap-3 px-8 py-6 text-sm text-gray-500 md:flex-row">

            <p>
              © 2026{" "}
              <span className="font-semibold text-green-700">
                SaveBite
              </span>
              . All rights reserved.
            </p>

            <button className="font-medium text-green-700 hover:underline">
              Need Help? Contact Support
            </button>

          </div>
        </footer>

      </div>
    </div>
  );
}