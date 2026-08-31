import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../constants/appRoutes";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f8f3] px-4 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                <AlertCircle className="h-12 w-12 text-green-700" />
            </div>

            <h1 className="mt-8 font-serif text-5xl font-black text-gray-900 md:text-6xl">
                404
            </h1>

            <h2 className="mt-4 text-2xl font-bold text-gray-800">
                Page Not Found
            </h2>

            <p className="mx-auto mt-4 max-w-md text-gray-600">
                Oops! It looks like the page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
            </p>

            <button
                type="button"
                onClick={() => navigate(APP_ROUTES.PUBLIC.HOME)}
                className="mt-8 flex items-center gap-2 rounded-full bg-green-700 px-8 py-3.5 font-bold text-white shadow-md transition-transform hover:-translate-y-1 hover:bg-green-800 hover:shadow-lg"
            >
                <Home size={20} />
                Return to Home
            </button>
        </div>
    );
}
