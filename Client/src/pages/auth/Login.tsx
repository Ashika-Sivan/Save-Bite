import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Eye, EyeOff, User, Store } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";

import { login, googleLogin, getVendorStatus } from "../../services/auth.service";
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

    // Request Notification permission on user interaction
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

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

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google authentication failed.");
      return;
    }

    setLoading(true);
    try {
      const response = await googleLogin(credentialResponse.credential);
      const { user, accessToken } = response.data || response;

      if (!user || !accessToken) {
        throw new Error("Unable to login with Google.");
      }

      dispatch(
        setCredentials({
          user,
          accessToken,
        })
      );
      toast.success("Login successful!");

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
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        general: error.response?.data?.message || error.message || "Google Login failed.",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-light px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-40 blur-[120px] pointer-events-none">
        <div className="aspect-square h-[50rem] rounded-full bg-brand-primary/30" />
      </div>
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 opacity-30 blur-[100px] pointer-events-none">
        <div className="aspect-[4/3] h-[40rem] rounded-[100%] bg-brand-primary/20" />
      </div>
      
      <div className="animate-slide-up relative z-10 w-full max-w-md space-y-8 rounded-[2.5rem] bg-white/95 backdrop-blur-sm p-10 shadow-2xl shadow-brand-primary/10 sm:p-12 border border-brand-primary/5">
        {/* Brand Header */}
        <div className="text-center">
          <div
            className="inline-flex cursor-pointer items-center gap-3 transition-transform hover:scale-105"
            onClick={() => navigate("/")}
          >
            <div className="flex h-12 w-12 overflow-hidden items-center justify-center rounded-full bg-brand-primary shadow-lg shadow-brand-primary/30">
              <img src="/logo.png" alt="SaveBite Logo" className="h-full w-full object-cover" />
            </div>
            <span className="text-3xl font-display font-bold tracking-tight text-brand-dark">SaveBite</span>
          </div>

          <h1 className="mt-8 text-3xl font-display font-semibold tracking-tight text-brand-dark">
            {activeRole === "vendor" ? "Partner Portal 🏪" : "Welcome Back 👋"}
          </h1>
          <p className="mt-3 text-sm text-gray-500/90 font-medium leading-relaxed">
            {activeRole === "vendor"
              ? "Access your restaurant dashboard."
              : "Log in to rescue surplus food near you."}
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex rounded-2xl bg-brand-light/50 p-1.5 border border-brand-primary/10">
          <button
            type="button"
            onClick={() => handleRoleChange("customer")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-300 ${
              activeRole === "customer"
                ? "bg-white text-brand-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <User size={18} className={activeRole === "customer" ? "text-brand-primary" : ""} />
            Customer
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("vendor")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-300 ${
              activeRole === "vendor"
                ? "bg-white text-brand-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Store size={18} className={activeRole === "vendor" ? "text-brand-primary" : ""} />
            Partner
          </button>
        </div>

        {/* Error Alert */}
        {errors.general && (
          <div className="animate-fade-in rounded-xl bg-red-50 p-4 border border-red-100">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-red-500">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-bold text-red-800">{errors.general}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email */}
          <div className="space-y-2">
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
              className={`block w-full rounded-2xl border px-4 py-3.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500/20"
                  : "border-brand-primary/20 bg-white/50 focus:border-brand-primary focus:bg-white focus:ring-brand-primary/20"
              }`}
            />
            {errors.email && <p className="animate-fade-in text-sm font-semibold text-red-600">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-brand-primary transition-colors hover:text-brand-primary-hover hover:underline"
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
                className={`block w-full rounded-2xl border px-4 py-3.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 pr-10 ${
                  errors.password
                    ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500/20"
                    : "border-brand-primary/20 bg-white/50 focus:border-brand-primary focus:bg-white focus:ring-brand-primary/20"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-1 flex items-center p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && <p className="animate-fade-in text-sm font-semibold text-red-600">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full justify-center rounded-full bg-brand-primary px-4 py-4 text-sm font-bold text-white shadow-lg shadow-brand-primary/20 transition-all hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Sign in securely"
            )}
          </button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest leading-6">
            <span className="bg-white px-4 text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center transition-transform hover:scale-[1.02]">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Google Login Failed")}
            useOneTap
            shape="pill"
            theme="outline"
            text="continue_with"
            size="large"
            width="384"
          />
        </div>

        <p className="mt-8 text-center text-sm font-medium text-gray-600">
          Don't have an account?{" "}
          <Link
            to={`/signup${activeRole === "vendor" ? "?role=vendor" : ""}`}
            className="font-bold text-brand-primary transition-colors hover:text-brand-primary-hover hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}} />
    </div>
  );
}