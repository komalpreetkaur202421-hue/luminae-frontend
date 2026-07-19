import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Calendar, Mail, Pencil } from "lucide-react";
import { getBlogs, getProfile } from "@/lib/api";
import { useAuth, isBlogOwner } from "@/lib/auth";
import { formatDate } from "@/lib/blog-utils";
import { PageShell, Spinner } from "@/components/PageShell";
import { BlogCard } from "@/components/BlogCard";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Luminae" },
      {
        name: "description",
        content: "Your writer profile on Luminae.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, isLoggedIn, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !isLoggedIn) {
      navigate({ to: "/login" });
    }
  }, [ready, isLoggedIn, navigate]);

  // Fetch full profile from backend
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: ready && isLoggedIn,
  });

  const { data: blogs } = useQuery({
    queryKey: ["blogs"],
    queryFn: getBlogs,
    retry: 1,
    enabled: ready && isLoggedIn,
  });

  const myBlogs = useMemo(
    () => (blogs ?? []).filter((b) => isBlogOwner(b, user)),
    [blogs, user]
  );

  if (!ready || !isLoggedIn) {
    return (
      <PageShell>
        <Spinner label="Loading profile" />
      </PageShell>
    );
  }

  const displayName =
    profile?.name ||
    user?.name ||
    user?.username ||
    "Writer";

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl glass-strong p-8 text-center sm:p-12"
        >
          {/* Avatar */}
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt={displayName}
              className="mx-auto h-24 w-24 rounded-full object-cover border-4 border-primary/20"
            />
          ) : (
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-primary/20 text-4xl font-bold text-primary shadow-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <h1 className="mt-5 font-display text-3xl font-bold">
            {displayName}
          </h1>

          {profile?.email && (
            <p className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail size={14} />
              {profile.email}
            </p>
          )}

          {profile?.bio && (
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
          )}

          <div className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-4">
            <div className="rounded-2xl glass p-5">
              <BookOpen size={18} className="mx-auto text-primary" />
              <p className="mt-2 font-display text-2xl font-bold">
                {myBlogs.length}
              </p>
              <p className="text-xs text-muted-foreground">
                Total Blogs
              </p>
            </div>

            <div className="rounded-2xl glass p-5">
              <Calendar size={18} className="mx-auto text-primary" />
              <p className="mt-2 font-display text-sm font-bold">
                {profile?.joinedAt
                  ? formatDate(profile.joinedAt)
                  : profile?.createdAt
                  ? formatDate(profile.createdAt)
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                Joined
              </p>
            </div>
          </div>

          <button
            className="mt-8 inline-flex items-center gap-2 rounded-2xl glass px-6 py-3 text-sm font-semibold transition-transform hover:scale-105"
            onClick={() => navigate({ to: "/profile/edit" })}
          >
            <Pencil size={15} />
            Edit Profile
          </button>
        </motion.div>

        {/* My Writing */}
        {myBlogs.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 font-display text-2xl font-semibold">
              My Writing
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              {myBlogs.map((blog, i) => (
                <BlogCard
                  key={blog._id}
                  blog={blog}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}

        {myBlogs.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            No published blogs yet —{" "}
            <Link
              to="/create"
              className="font-semibold text-primary"
            >
              start writing
            </Link>
            .
          </p>
        )}
      </div>
    </PageShell>
  );
}