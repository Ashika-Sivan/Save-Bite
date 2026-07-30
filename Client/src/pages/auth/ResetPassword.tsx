import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";
import {
  Leaf,
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl md:grid-cols-2">
        {/* Left panel */}
        <div className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground md:flex">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-foreground/15">
              <Leaf className="h-5 w-5" />
            </span>

            <span className="font-display text-2xl font-semibold">
              SaveBite
            </span>
          </div>

          <div>
            <h2 className="font-display text-4xl leading-tight">
              Set a new password
            </h2>

            <p className="mt-4 max-w-sm text-sm text-primary-foreground/80">
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
        <div className="p-8 sm:p-10">
          <Link
            to="/login"
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to log in
          </Link>

          {!token && !isCompleted && (
            <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              This reset link is missing a token. Please request a new password
              reset link from the login page.
            </div>
          )}

          {isCompleted ? (
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <h1 className="mt-4 font-display text-3xl font-semibold">
                Password updated
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Your password has been reset successfully. You can now log in
                using your new password.
              </p>

              <Link
                to="/login"
                className="mt-8 grid h-11 w-full place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Continue to log in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h1 className="font-display text-3xl font-semibold">
                  Reset password
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                  Enter a new password containing at least 8 characters.
                </p>
              </div>

              {/* New password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                  New password
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    id="password"
                    required
                    minLength={8}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm new password
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

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
                    className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                <p className="text-sm font-medium text-destructive">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!token || isLoading}
                className="grid h-11 w-full place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
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