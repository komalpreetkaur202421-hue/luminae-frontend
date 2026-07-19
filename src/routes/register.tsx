import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { registerUser } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { GlassInput } from "@/components/GlassInput";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — Luminae" },
      { name: "description", content: "Create your Luminae account and start writing." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = "Name must be at least 2 characters.";
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email address.";
    if (password.length < 6) e.password = "Password must be at least 6 characters.";
    if (confirm !== password) e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await registerUser({ name, email, password });
      const token = data.token ?? data.accessToken;
      const user = data.user ?? data;
      if (token) {
      login(token, user);
      navigate({ to: "/dashboard" });
      } else {
      // Clear the form before leaving
       setName("");
      setEmail("");
      setPassword("");
      setConfirm("");

  navigate({ to: "/login" });
}
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message ||
          "Registration failed. Make sure the backend is running.",
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
            <UserPlus size={24} className="text-primary" />
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold">Begin your story</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an account and find your calm space to write.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />
          <GlassInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
            autoComplete="email"
          />
          <GlassInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
            autoComplete="new-password"
          />
          <GlassInput
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={errors.confirm}
            required
            autoComplete="new-password"
          />

          {serverError && (
            <p className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-in">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-primary py-3.5 font-bold text-primary-foreground shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:opacity-80">
            Sign in
          </Link>
        </p>
      </motion.div>
    </PageShell>
  );
}