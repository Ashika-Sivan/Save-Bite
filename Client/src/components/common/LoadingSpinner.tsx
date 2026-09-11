import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ message = "Loading...", fullScreen = false }: LoadingSpinnerProps) => {
  const containerClass = fullScreen 
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
    : "flex flex-col items-center justify-center p-10";

  return (
    <div className={containerClass}>
      <Loader2 className="h-10 w-10 animate-spin text-green-600" />
      {message && <p className="mt-4 text-sm font-medium text-gray-600 animate-pulse">{message}</p>}
    </div>
  );
};
