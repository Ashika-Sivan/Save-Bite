import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser,sendOtp } from "../../services/auth.service";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword:"",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if(form.password!==form.confirmPassword){
      alert("password do not match")
      return 
    }
    const signupData={
      name:form.name,
      email:form.email,
      password:form.password,
      phone:form.phone
    }

    try {
      // await signupUser(form);
      await signupUser(signupData)//here state is used to send the data from one react page to another reat page 
      navigate("/otp", {
        state: { email: form.email },
      });

    const otpResponse = await sendOtp(form.email);
  console.log("OTP RESPONSE:", otpResponse);
    } catch (error) {
      console.log(error);
      alert("Signup failed");
    }
  };

return (
  <div className="min-h-screen flex bg-[#f8f4ec]">
    {/* Left Section */}
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

    {/* Right Section */}
    <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-[24px] bg-white p-8 shadow-sm border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900">
          Create Your Account
        </h2>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="mt-1 w-full rounded-xl border border-gray-300 bg-[#fbf8ef] px-4 py-3 outline-none focus:border-green-700"
            />
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
              required
              className="mt-1 w-full rounded-xl border border-gray-300 bg-[#fbf8ef] px-4 py-3 outline-none focus:border-green-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800">
              Phone
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-[#fbf8ef] px-4 py-3 outline-none focus:border-green-700"
            />
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
              required
              autoComplete="new-password"
              className="mt-1 w-full rounded-xl border border-gray-300 bg-[#fbf8ef] px-4 py-3 outline-none focus:border-green-700"
            />
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
              required
              autoComplete="new-password"
              className="mt-1 w-full rounded-xl border border-gray-300 bg-[#fbf8ef] px-4 py-3 outline-none focus:border-green-700"
            />
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