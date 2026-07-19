import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { loginUser } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { GlassInput } from "@/components/GlassInput";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Luminae" },
      {
        name: "description",
        content: "Sign in to your Luminae writing space.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Clear form whenever this page loads
  useEffect(() => {
    setEmail("");
    setPassword("");
    setError("");
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser({ email, password });

      const token = data.token ?? data.accessToken;
      const user = data.user ?? data;

      if (!token) throw new Error("No token returned");

      login(token, user);

      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Login failed. Check your credentials and make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell className="flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl glass-strong p-8 sm:p-10"
      >
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15">
            <LogIn size={24} className="text-primary" />
          </span>

          <h1 className="mt-5 font-display text-3xl font-bold">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Your quiet writing space is waiting.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <GlassInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded accent-[var(--primary)]"
              />
              Remember me
            </label>

            <button
              type="button"
              onClick={() =>
                setError(
                  "Password reset is coming soon — contact support for now."
                )
              }
              className="font-medium text-primary transition-opacity hover:opacity-80"
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <p className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-in">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-primary py-3.5 font-bold text-primary-foreground shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary hover:opacity-80"
          >
            Create an account
          </Link>
        </p>
      </motion.div>
    </PageShell>
  );
}