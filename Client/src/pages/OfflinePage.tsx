import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6faf5] p-6 font-sans text-gray-800">
      <div className="mx-auto max-w-md text-center space-y-6">
        
        {/* Icon Badge */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-green-100 text-green-800 shadow-inner">
          <WifiOff size={40} />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">You are Offline</h1>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            It looks like your internet connection dropped. Check your network or try reconnecting to rescue surplus food.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-2">
          <button
            type="button"
            onClick={handleReload}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 active:scale-95"
          >
            <RefreshCw size={16} />
            Try Reconnecting
          </button>

          <Link
            to="/home"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <Home size={16} />
            Go to Saved Home
          </Link>
        </div>

        <p className="text-xs text-gray-400">
          SaveBite PWA Offline Support Enabled
        </p>
      </div>
    </div>
  );
}
