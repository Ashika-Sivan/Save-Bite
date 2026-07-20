import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../../services/auth.service";
import axios from 'axios'
const Signup = () => {
  const navigate = useNavigate();

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
    `mt-1 w-full rounded-xl bg-[#fbf8ef] px-4 py-3 outline-none ${
      error
        ? "border border-red-500 focus:border-red-600"
        : "border border-gray-300 focus:border-green-700"
    }`;

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!validateForm()) return;

  const signupData = {
    name: form.name.trim(),
    email: form.email.trim(),
    password: form.password,
    phone: form.phone.trim(),
  };

  try {
    await signupUser(signupData);//after signupp then navigatet to the otp page
    navigate("/otp",{
      state:{email:signupData.email}
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      if (message === "Email already exists") {
        setErrors((prev) => ({ ...prev, email: "Email already exists" }));
        return;
      }
    }
    alert("Signup failed. Please try again.");
    return;
  }
};

  return (
    <div className="min-h-screen flex bg-[#f8f4ec]">
      <div className="hidden lg:flex w-1/2 bg-green-800 text-white p-10 flex-col justify-between rounded-r-[28px]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
            🌱
          </div>
          <h1 className="text-2xl font-bold">SaveBite</h1>
        </div>

        <div>
          <h2 className="text-5xl font-bold leading-tight">
            Good food deserves a <br />
            second chance.
          </h2>
          <p className="mt-5 max-w-md text-green-100">
            Sign up to rescue meals nearby, share your surplus, and watch your
            impact grow with every bite saved.
          </p>
        </div>

        <div className="flex gap-12">
          <div>
            <h3 className="text-3xl font-bold">12k+</h3>
            <p className="text-green-100">meals rescued</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">340</h3>
            <p className="text-green-100">neighborhoods</p>
          </div>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-[24px] bg-white p-8 shadow-sm border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900">
            Create Your Account
          </h2>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-800">
                Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className={inputClass(errors.name)}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputClass(errors.email)}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800">
                Phone
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter 10 digit phone number"
                maxLength={10}
                className={inputClass(errors.phone)}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800">
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
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800">
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
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="mt-4 w-full rounded-xl bg-green-800 py-3 font-semibold text-white hover:bg-green-900 transition"
            >
              Signup
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="cursor-pointer font-medium text-green-800 hover:underline"
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