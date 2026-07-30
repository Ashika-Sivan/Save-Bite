import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";

import { login } from "../../services/auth.service";
import { setCredentials } from "../../redux/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      newErrors.password =
        "Password must contain at least 8 characters";
    }

    setErrors(newErrors);

    return !newErrors.email && !newErrors.password;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await login({
        email: form.email.trim(),
        password: form.password,
      });

      // ResponseHelper structure
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
      toast.success("Login successfull")

      navigate("/home", {
        replace: true,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrors((prev) => ({
          ...prev,
          general:
            error.response?.data?.message ||
            "Login failed. Please try again.",
        }));

        return;
      }

      if (error instanceof Error) {
        setErrors((prev) => ({
          ...prev,
          general: error.message,
        }));

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
    `w-full rounded-md border px-3 py-2 text-sm outline-none ${
      error
        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
        : "border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200"
    }`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-white p-8 shadow">

        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-green-700">
            Welcome back
          </h1>

          <p className="text-sm text-gray-500">
            Log in to continue to SaveBite.
          </p>
        </div>

        {errors.general && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {errors.general}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          noValidate
        >
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium"
            >
              Email
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

            {errors.email && (
              <p className="text-sm text-red-500">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium"
              >
                Password
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-green-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className={inputClass(errors.password)}
            />

            {errors.password && (
              <p className="text-sm text-red-500">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-green-600 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}