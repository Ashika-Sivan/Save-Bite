import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

import { adminLogin } from "../../services/admin.service";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { setCredentials } from "../../redux/authSlice";

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await adminLogin({
        email,
        password,
      });

      const { user, accessToken } = response.data;

      // User logged in but is not an admin
      if (user.role !== "admin") {
        const message =
          "You are not authorized to access the admin panel.";

        setError(message);
        toast.error(message);
        return;
      }

      // Store admin details in Redux
      dispatch(
        setCredentials({
          user,
          accessToken,
        })
      );

      toast.success("Admin login successful!");

      navigate("/admin/dashboard", {
        replace: true,
      });

    } catch (error: unknown) {

      // Axios error
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          "Login failed. Please try again.";

        setError(message);
        return;
      }

      // Normal JavaScript error
      if (error instanceof Error) {
        setError(error.message);
        return;
      }

      // Unknown error
      setError("Something went wrong. Please try again.");

    } finally {
      // Always stop loading
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf7ef] p-5">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-lg">

        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-700 text-3xl text-white">
            🍃
          </div>

          <h1 className="text-3xl font-bold text-green-700">
            SaveBite
          </h1>

          <p className="mt-2 text-gray-500">
            Admin Portal
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Email
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 outline-none transition focus:border-green-600"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-11 outline-none transition focus:border-green-600"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-500"
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-6 w-full text-center text-sm text-green-700 hover:underline"
        >
          Back to Home
        </button>

      </div>
    </div>
  );
};

export default AdminLogin;