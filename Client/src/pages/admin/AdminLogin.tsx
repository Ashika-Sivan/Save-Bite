import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

import { adminLogin } from "../../services/admin.service";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { setCredentials } from "../../redux/authSlice";
import adminBg from "../../assets/admin-bg-reference.jpg";

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    
    setFormErrors({});
    setError("");

    const newErrors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    
    if (!password.trim()) {
      newErrors.password = "Password is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    setLoading(true);

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
    <div className="flex min-h-screen w-full bg-white font-sans">
      {/* Left Section - Form */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-20 xl:px-32 2xl:px-40">
        <div className="w-full max-w-md mx-auto">
          {/* Logo / Brand */}
          <div className="mb-10 flex items-center gap-2">
             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-700 text-xl text-white">
               🍃
             </div>
             <span className="text-xl font-bold text-gray-800">SaveBite</span>
          </div>

          <h1 className="mb-8 text-3xl font-bold text-gray-900">
            Admin Login
          </h1>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Email address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                }}
                autoComplete="email"
                className={`w-full rounded-lg border ${formErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#3E5C35] focus:ring-[#3E5C35]'} py-3.5 px-4 text-sm outline-none transition focus:ring-1`}
              />
              {formErrors.email && (
                <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors({ ...formErrors, password: "" });
                  }}
                  autoComplete="current-password"
                  className={`w-full rounded-lg border ${formErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#3E5C35] focus:ring-[#3E5C35]'} py-3.5 pl-4 pr-11 text-sm outline-none transition focus:ring-1`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-xs text-red-500">{formErrors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end mt-2">
              <Link
                to="/admin/forgot-password"
                className="text-sm font-medium text-gray-500 hover:text-[#3E5C35] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-[#3E5C35] py-3.5 text-sm font-semibold text-white transition hover:bg-[#2F4728] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing In..." : "Login"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-8 text-sm font-medium text-gray-400 transition hover:text-gray-700"
          >
            &larr; Back to Home
          </button>
        </div>
      </div>

      {/* Right Section - Image */}
      <div className="hidden lg:block lg:w-1/2 p-6 h-screen">
        <div className="h-full w-full overflow-hidden rounded-[2.5rem] bg-gray-100 relative">
          <img
            src={adminBg}
            alt="Monstera leaves"
            className="absolute right-0 h-full w-[200%] max-w-none object-cover object-right"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;