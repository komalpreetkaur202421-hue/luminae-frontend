import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import { updateProfile, getProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/profile_/edit")({
  component: EditProfilePage,
});

function EditProfilePage() {
  const { user, isLoggedIn, ready } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch current profile data
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: ready && isLoggedIn,
  });

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  // Sync current backend data into input fields once loaded
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
      setAvatar(profile.avatar || "");
    }
  }, [profile]);

  // Protect route
  useEffect(() => {
    if (ready && !isLoggedIn) {
      navigate({ to: "/login" });
    }
  }, [ready, isLoggedIn, navigate]);

  // Save profile changes using React Query Mutation
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      // Refresh the cache for the profile data
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      // Go back to the profile page
      navigate({ to: "/profile" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name, bio, avatar });
  };

  if (!ready || !isLoggedIn) {
    return null;
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Back to Profile
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl glass-strong p-8 sm:p-10"
        >
          <h1 className="font-display text-2xl font-bold">Edit Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update your public profile information.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Display Name Input */}
            <div>
              <label className="block text-sm font-semibold mb-2">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full rounded-2xl border border-glass-border bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            {/* Avatar URL Input */}
            <div>
              <label className="block text-sm font-semibold mb-2">Avatar URL</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full rounded-2xl border border-glass-border bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Bio Input */}
            <div>
              <label className="block text-sm font-semibold mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short bio about yourself..."
                rows={4}
                className="w-full rounded-2xl border border-glass-border bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {mutation.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </motion.div>
      </div>
    </PageShell>
  );
}