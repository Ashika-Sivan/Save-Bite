import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { resetPassword } from "../../services/auth.service";

const AdminResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({});
    setError(null);

    if (!token) {
      const message = "Reset token is missing from the link.";
      setError(message);
      toast.error(message);
      return;
    }

    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters.";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter.";
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = "Password must contain at least one lowercase letter.";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one number.";
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one special character.";
    } else if (/\s/.test(password)) {
      newErrors.password = "Password cannot contain spaces.";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword({
        token,
        newPassword: password,
      });

      setIsCompleted(true);
      setPassword("");
      setConfirmPassword("");

      toast.success("Password reset successfully! You can now log in.");
    } catch (error: any) {
      const message = error.response?.data?.message || "The reset link is invalid or has expired.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
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
          <p className="mt-2 text-gray-500">Reset Admin Password</p>
        </div>

        {!token && !isCompleted && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 text-center">
            This reset link is missing a token.
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 text-center">
            {error}
          </div>
        )}

        {isCompleted ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
              <CheckCircle2 size={32} />
            </div>
            <div className="text-lg font-semibold text-gray-900">Password Updated</div>
            <p className="text-sm text-gray-500">Your admin password has been changed successfully.</p>
            <Link
              to="/admin/login"
              className="mt-4 block w-full rounded-xl bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800"
            >
              Continue to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="mb-2 block font-medium text-gray-700">New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors({ ...formErrors, password: undefined });
                  }}
                  className={`w-full rounded-xl border ${formErrors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-600'} py-3 pl-11 pr-11 outline-none transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formErrors.password && <p className="mt-1 text-xs text-red-500">{formErrors.password}</p>}
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: undefined });
                  }}
                  className={`w-full rounded-xl border ${formErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-600'} py-3 pl-11 pr-11 outline-none transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{formErrors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={!token || isLoading}
              className="flex justify-center items-center w-full rounded-xl bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-500"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminResetPassword;
