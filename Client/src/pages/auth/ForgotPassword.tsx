import { Link } from "react-router-dom";
import { useState } from "react";
import { forgotPassword } from "../../services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError("");
      await forgotPassword(email);
      setSubmitted(true);
    } catch (_err) {
      setError("Failed to send reset link");
    }
  };

  return (
    <div className="min-h-screen bg-brand-light text-brand-dark relative overflow-hidden flex items-center justify-center px-4">
      {/* Decorative Blob 1 */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-primary/20 mix-blend-multiply blur-3xl filter animate-blob" />
      {/* Decorative Blob 2 */}
      <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-secondary/20 mix-blend-multiply blur-3xl filter animate-blob animation-delay-2000" />
      {/* Decorative Blob 3 */}
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-brand-primary/20 mix-blend-multiply blur-3xl filter animate-blob animation-delay-4000" />

      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/60 bg-white/40 p-10 shadow-2xl backdrop-blur-md relative z-10 transition-all hover:bg-white/50">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-brand-dark">
            Forgot password?
          </h1>
          <p className="text-sm font-medium text-brand-dark/70">
            Enter your email and we'll send you a link to reset it.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary/10 p-4 text-sm font-medium text-brand-dark">
              Reset link sent to <span className="font-bold text-brand-primary">{email}</span>.
            </div>

            <Link
              to="/login"
              className="inline-block text-sm font-bold text-brand-primary hover:text-brand-secondary transition-colors hover:underline"
            >
              Back to log in
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            {error && <p className="text-sm font-bold text-red-500 text-center bg-red-100 rounded-lg p-2">{error}</p>}

            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">
                Email
              </label>

              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/50 bg-white/50 px-4 py-3.5 text-sm font-bold text-brand-dark outline-none transition-all focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-brand-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-primary/30 transition-all hover:scale-105 hover:bg-brand-secondary active:scale-95"
            >
              Send reset link
            </button>

            <p className="text-center text-sm font-medium text-brand-dark/70">
              Remember your password?{" "}
              <Link to="/login" className="font-bold text-brand-primary hover:text-brand-secondary hover:underline transition-colors">
                Log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}