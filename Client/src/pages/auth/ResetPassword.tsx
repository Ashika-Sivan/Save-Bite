import { Link,useSearchParams } from "react-router-dom";
import { useState } from "react";
import { resetPassword } from "../../services/auth.service";

export default function ResetPasswordPage() {
    const [SearchParams]=useSearchParams()
    const token=SearchParams.get("token")

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!token) {
    setError("Reset token is missing.");
    return;
  }

  if (password.length < 8) {
    setError("Password must be at least 8 characters.");
    return;
  }

  if (password !== confirm) {
    setError("Passwords do not match.");
    return;
  }

  try {
    setError(null);

    await resetPassword({
      token,
      newPassword: password,
    });

    setDone(true);
  } catch (error) {
    setError("Reset link is invalid or expired.");
  }
};
 return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Set a new password
          </h1>
          <p className="text-sm text-muted-foreground">
            Make sure it's at least 8 characters.
          </p>
        </div>

        {done ? (
          <div className="space-y-4 text-center">
            <div className="rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
              Your password has been reset successfully.
            </div>
            <Link
              to="/login"
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              Continue to log in
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                New password
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm" className="text-sm font-medium text-foreground">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                required
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Reset password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
