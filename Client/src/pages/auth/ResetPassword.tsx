import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { resetPassword } from "../../services/auth.service";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Reset Password — SaveBite";
  }, []);

const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setError(null);

  if (!token) {
    const message = "Reset token is missing from the link.";

    setError(message);
    toast.error(message);
    return;
  }

  if (password.length < 8) {
    const message = "Password must contain at least 8 characters.";

    setError(message);
    toast.error(message);
    return;
  }

  if (password !== confirmPassword) {
    const message = "Passwords do not match.";

    setError(message);
    toast.error(message);
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
  } catch (error: unknown) {
    console.error("Password reset failed:", error);

    const message = "The reset link is invalid or has expired.";

    setError(message);
    toast.error(message);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-brand-light text-brand-dark relative overflow-hidden flex items-center justify-center px-4 py-10 sm:px-6">
      {/* Decorative Blob 1 */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-primary/20 mix-blend-multiply blur-3xl filter animate-blob" />
      {/* Decorative Blob 2 */}
      <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-secondary/20 mix-blend-multiply blur-3xl filter animate-blob animation-delay-2000" />
      {/* Decorative Blob 3 */}
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-brand-primary/20 mix-blend-multiply blur-3xl filter animate-blob animation-delay-4000" />

      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/60 bg-white/40 shadow-2xl backdrop-blur-md relative z-10 md:grid-cols-2 transition-all">
        {/* Left panel */}
        <div className="relative hidden flex-col justify-between bg-brand-primary p-10 text-white md:flex">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 overflow-hidden place-items-center rounded-full bg-white">
              <img src="/logo.png" alt="SaveBite Logo" className="h-full w-full object-cover" />
            </span>

            <span className="font-display text-2xl font-semibold">
              SaveBite
            </span>
          </div>

          <div>
            <h2 className="font-display text-4xl font-bold leading-tight">
              Set a new password
            </h2>

            <p className="mt-4 max-w-sm text-sm font-medium text-white/80">
              Choose a strong password to keep your SaveBite account secure.
            </p>
          </div>

          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=70"
            alt="Fresh food"
            className="h-40 rounded-2xl object-cover shadow-lg"
          />
        </div>

        {/* Right panel */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <Link
            to="/login"
            className="mb-6 inline-flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-dark/60 hover:text-brand-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to log in
          </Link>

          {!token && !isCompleted && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-500 text-center">
              This reset link is missing a token. Please request a new password
              reset link from the login page.
            </div>
          )}

          {isCompleted ? (
            <div className="text-center space-y-4">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-primary/10 text-brand-primary">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <h1 className="font-display text-3xl font-bold text-brand-dark">
                Password updated
              </h1>

              <p className="text-sm font-medium text-brand-dark/70">
                Your password has been reset successfully. You can now log in
                using your new password.
              </p>

              <Link
                to="/login"
                className="mt-8 grid h-12 w-full place-items-center rounded-full bg-brand-primary text-sm font-bold text-white shadow-lg shadow-brand-primary/30 transition-all hover:scale-105 hover:bg-brand-secondary active:scale-95"
              >
                Continue to log in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <h1 className="font-display text-3xl font-bold text-brand-dark">
                  Reset password
                </h1>

                <p className="text-sm font-medium text-brand-dark/70">
                  Enter a new password containing at least 8 characters.
                </p>
              </div>

              {/* New password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">
                  New password
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-dark/40" />

                  <input
                    id="password"
                    required
                    minLength={8}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/50 bg-white/50 pl-11 pr-11 text-sm font-bold text-brand-dark outline-none transition-all focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-dark/40 hover:text-brand-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-bold uppercase tracking-widest text-brand-dark/60"
                >
                  Confirm new password
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-dark/40" />

                  <input
                    id="confirmPassword"
                    required
                    minLength={8}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    className="h-12 w-full rounded-2xl border border-white/50 bg-white/50 pl-11 pr-11 text-sm font-bold text-brand-dark outline-none transition-all focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10"
                  />

                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-dark/40 hover:text-brand-primary transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm font-bold text-red-500 text-center bg-red-100 rounded-lg p-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!token || isLoading}
                className="grid h-12 w-full place-items-center rounded-full bg-brand-primary text-sm font-bold text-white shadow-lg shadow-brand-primary/30 transition-all hover:scale-105 hover:bg-brand-secondary active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Updating password…
                  </span>
                ) : (
                  "Reset password"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;