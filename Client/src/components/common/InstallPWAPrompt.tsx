import { useEffect, useState } from "react";
import { Download, X, Smartphone, ShieldCheck } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallPWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  });

  useEffect(() => {

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      const lastDismissed = localStorage.getItem("savebite_pwa_dismissed");
      if (!lastDismissed || Date.now() - parseInt(lastDismissed, 10) > 86400000 * 3) {
        setTimeout(() => {
          setIsVisible(true);
        }, 2000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the SaveBite PWA install prompt");
    }

    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("savebite_pwa_dismissed", Date.now().toString());
  };

  if (isStandalone || !isVisible || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-bounce-in">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-green-200 bg-white p-4 shadow-xl ring-1 ring-black/5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-700 text-white shadow-sm">
            <Smartphone size={24} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-gray-900 text-sm">Install SaveBite App</h4>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-800">
                <ShieldCheck size={10} /> Fast & Offline
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Get instant surplus food alerts & 1-tap ordering from home screen!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex items-center gap-1.5 rounded-xl bg-green-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-green-800 active:scale-95"
          >
            <Download size={14} />
            Install
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
