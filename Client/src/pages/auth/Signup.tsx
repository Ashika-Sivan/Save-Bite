import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signupUser } from "../../services/auth.service";
import { User, Store, ArrowRight, ShieldCheck } from "lucide-react";
import axios from "axios";

type AuthRole = "customer" | "vendor";

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read active role from query param ?role=vendor or default to customer
  const activeRole: AuthRole = searchParams.get("role") === "vendor" ? "vendor" : "customer";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleRoleChange = (role: AuthRole) => {
    setSearchParams({ role });
    setErrors({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    };

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    } else if (!/^[A-Za-z ]+$/.test(form.name.trim())) {
      newErrors.name = "Name can contain only letters";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d+$/.test(form.phone)) {
      newErrors.phone = "Phone number must contain only digits";
    } else if (form.phone.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    } else if (!/^[6-9]/.test(form.phone)) {
      newErrors.phone = "Phone number must start with 6, 7, 8 or 9";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(form.password)
    ) {
      newErrors.password =
        "Password must contain uppercase, lowercase, number and special character";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const inputClass = (error: string) =>
    `mt-1 w-full rounded-xl bg-[#fbf8ef] px-4 py-3 outline-none transition text-sm ${
      error
        ? "border border-red-500 focus:border-red-600"
        : "border border-gray-300 focus:border-green-700"
    }`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const signupData = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim(),
    };

    try {
      await signupUser(signupData);
      navigate("/otp", {
        state: { email: signupData.email, isVendor: activeRole === "vendor" },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        if (message === "Email already exists") {
          setErrors((prev) => ({ ...prev, email: "Email already exists" }));
          return;
        }
      }
      alert("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8f4ec]">
      {/* Left Branding Sidebar */}
      <div className="hidden lg:flex w-1/2 bg-green-800 text-white p-10 flex-col justify-between rounded-r-[28px]">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
            🌱
          </div>
          <h1 className="text-2xl font-bold">SaveBite</h1>
        </div>

        <div>
          {activeRole === "vendor" ? (
            <>
              <h2 className="text-5xl font-bold leading-tight">
                Turn surplus food <br /> into steady revenue.
              </h2>
              <p className="mt-5 max-w-md text-green-100">
                Partner with SaveBite to sell excess daily meals, reach local customers, and track your 90% payout earnings directly.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-5xl font-bold leading-tight">
                Good food deserves a <br />
                second chance.
              </h2>
              <p className="mt-5 max-w-md text-green-100">
                Sign up to rescue meals nearby, share your surplus, and watch your
                impact grow with every bite saved.
              </p>
            </>
          )}
        </div>

        <div className="flex gap-12">
          <div>
            <h3 className="text-3xl font-bold">12k+</h3>
            <p className="text-green-100">meals rescued</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">340</h3>
            <p className="text-green-100">partner restaurants</p>
          </div>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-[24px] bg-white p-8 shadow-sm border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900">
            {activeRole === "vendor" ? "Register Restaurant 🏪" : "Create Account 🛒"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {activeRole === "vendor"
              ? "Register your business account to list surplus food."
              : "Sign up to discover and rescue delicious food."}
          </p>

          {/* Role Switcher Tabs */}
          <div className="mt-5 grid grid-cols-2 rounded-2xl bg-gray-100 p-1.5 gap-1 border border-gray-200">
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
                  ? "bg-green-800 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Store size={16} />
              Restaurant Partner
            </button>
          </div>

          {activeRole === "vendor" && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-xs font-medium text-green-800">
              <ShieldCheck size={18} className="shrink-0 text-green-800" />
              <span>Step 1: Create vendor account. Step 2: Submit restaurant business verification.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-800">
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className={inputClass(errors.name)}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-800">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputClass(errors.email)}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-800">
                Phone Number
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter 10 digit phone number"
                maxLength={10}
                className={inputClass(errors.phone)}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-800">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="Enter password"
                className={inputClass(errors.password)}
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-800">
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="Confirm password"
                className={inputClass(errors.confirmPassword)}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-green-800 py-3 font-semibold text-white hover:bg-green-900 transition disabled:opacity-50"
            >
              {loading ? "Creating Account..." : activeRole === "vendor" ? "Register Partner Account" : "Sign Up"}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-600">
            Already have an account?{" "}
            <span
              onClick={() => navigate(`/login${activeRole === "vendor" ? "?role=vendor" : ""}`)}
              className="cursor-pointer font-bold text-green-800 hover:underline"
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;