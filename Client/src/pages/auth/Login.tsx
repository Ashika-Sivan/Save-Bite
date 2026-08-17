import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Eye, EyeOff, User, Store, ArrowRight, ShieldCheck } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

import { login, getVendorStatus } from "../../services/auth.service";
import { setCredentials } from "../../redux/authSlice";
import { APP_ROUTES } from "../../constants/appRoutes";

type AuthRole = "customer" | "vendor";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial role from query param ?role=vendor or default to customer
  const initialRole = searchParams.get("role") === "vendor" ? "vendor" : "customer";
  const [activeRole, setActiveRole] = useState<AuthRole>(initialRole);

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "vendor") {
      setActiveRole("vendor");
    } else if (roleParam === "customer") {
      setActiveRole("customer");
    }
  }, [searchParams]);

  const handleRoleChange = (role: AuthRole) => {
    setActiveRole(role);
    setSearchParams({ role });
    setErrors({ email: "", password: "", general: "" });
  };

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      general: "",
    };

    const email = form.email.trim();

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await login({
        email: form.email.trim(),
        password: form.password,
      });

      const { user, accessToken } = response.data;

      if (!user || !accessToken) {
        setErrors((prev) => ({
          ...prev,
          general: "Unable to login. Please try again.",
        }));
        return;
      }

      dispatch(
        setCredentials({
          user,
          accessToken,
        })
      );
      toast.success("Login successful!");

      // If user selected Vendor tab or is a vendor role
      if (activeRole === "vendor" || user.role === "vendor") {
        try {
          const statusRes = await getVendorStatus();
          if (statusRes.data.hasApplication) {
            const status = statusRes.data.status;
            if (status === "approved") navigate(APP_ROUTES.VENDOR.DASHBOARD, { replace: true });
            else if (status === "pending") navigate(APP_ROUTES.VENDOR.PENDING, { replace: true });
            else if (status === "rejected") navigate(APP_ROUTES.VENDOR.REJECTED, { replace: true });
            else navigate(APP_ROUTES.VENDOR.DASHBOARD, { replace: true });
          } else {
            navigate(APP_ROUTES.VENDOR.REGISTER, { replace: true });
          }
        } catch {
          navigate(APP_ROUTES.VENDOR.REGISTER, { replace: true });
        }
      } else {
        navigate("/home", { replace: true });
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrors((prev) => ({
          ...prev,
          general: error.response?.data?.message || "Login failed. Please try again.",
        }));
        return;
      }
      if (error instanceof Error) {
        setErrors((prev) => ({ ...prev, general: error.message }));
        return;
      }
      setErrors((prev) => ({
        ...prev,
        general: "Something went wrong. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (error: string) =>
    `w-full rounded-xl border bg-gray-50/50 px-4 py-3 text-sm text-gray-900 outline-none transition ${
      error
        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
        : "border-gray-300 focus:border-green-700 focus:bg-white focus:ring-2 focus:ring-green-100"
    }`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf7ef] px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
        {/* Brand Header */}
        <div className="text-center">
          <div
            className="inline-flex cursor-pointer items-center gap-2"
            onClick={() => navigate("/")}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-700 text-white shadow-md">
              🍃
            </div>
            <span className="text-2xl font-bold text-green-700">SaveBite</span>
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            {activeRole === "vendor" ? "Partner Portal Login 🏪" : "Welcome Back 👋"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {activeRole === "vendor"
              ? "Access your restaurant dashboard, orders, & daily menus."
              : "Log in to discover and rescue surplus food near you."}
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-2 rounded-2xl bg-gray-100 p-1.5 gap-1 border border-gray-200">
          <button
            type="button"
            onClick={() => handleRoleChange("customer")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              activeRole === "customer"
                ? "bg-white text-green-800 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <User size={16} />
            Customer / Foodie
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("vendor")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              activeRole === "vendor"
                ? "bg-green-700 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Store size={16} />
            Restaurant Partner
          </button>
        </div>

        {/* Vendor Partner Badge Info */}
        {activeRole === "vendor" && (
          <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50/80 p-3 text-xs font-medium text-green-800">
            <ShieldCheck size={18} className="shrink-0 text-green-700" />
            <span>Manage food menu items, track 90% revenue payouts, & verify pickup codes.</span>
          </div>
        )}

        {/* Error Alert */}
        {errors.general && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-600">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className={inputClass(errors.email)}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-green-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className={`${inputClass(errors.password)} pr-10`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-50 ${
              activeRole === "vendor"
                ? "bg-green-700 hover:bg-green-800"
                : "bg-green-700 hover:bg-green-800"
            }`}
          >
            {loading ? "Signing in..." : activeRole === "vendor" ? "Sign in to Vendor Portal" : "Sign in to SaveBite"}
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Don't have an account?{" "}
          <Link
            to={`/signup${activeRole === "vendor" ? "?role=vendor" : ""}`}
            className="font-bold text-green-700 hover:underline"
          >
            {activeRole === "vendor" ? "Register your restaurant" : "Sign up as Customer"}
          </Link>
        </p>
      </div>
    </div>
  );
}