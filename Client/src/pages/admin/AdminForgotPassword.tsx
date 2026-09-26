import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { forgotPassword } from "../../services/auth.service";

const AdminForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setError("");
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setFormError("Email is required.");
      return;
    }
    if (!emailRegex.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await forgotPassword(email);
      setSubmitted(true);
      toast.success("Reset link sent successfully.");
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to send reset link.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-[#faf7ef] p-5 h-screen">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-lg relative">
        <Link to="/admin/login" className="absolute top-8 left-8 text-gray-400 hover:text-green-700 transition">
          <ArrowLeft size={20} />
        </Link>
        <div className="mb-8 text-center mt-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-700 text-3xl text-white">
            🍃
          </div>
          <h1 className="text-3xl font-bold text-green-700">SaveBite</h1>
          <p className="mt-2 text-gray-500">Admin Password Recovery</p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="space-y-4 text-center">
             <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
              A reset link has been sent to <span className="font-bold">{email}</span>.
            </div>
            <Link
              to="/admin/login"
              className="mt-4 block w-full rounded-xl bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="mb-2 block font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your admin email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formError) setFormError("");
                  }}
                  className={`w-full rounded-xl border ${formError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-600'} py-3 pl-11 pr-4 outline-none transition`}
                />
              </div>
              {formError && <p className="mt-1 text-xs text-red-500">{formError}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex justify-center items-center w-full rounded-xl bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-500"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminForgotPassword;
