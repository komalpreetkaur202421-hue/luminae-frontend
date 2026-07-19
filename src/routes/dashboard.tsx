import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { PenLine, BookOpen, Clock, Flame, ArrowRight } from "lucide-react";
import { getBlogs } from "@/lib/api";
import { useAuth, isBlogOwner } from "@/lib/auth";
import { excerpt, formatDate, readingTime } from "@/lib/blog-utils";
import { PageShell, Spinner } from "@/components/PageShell";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Luminae" },
      { name: "description", content: "Your personal writing dashboard on Luminae." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, isLoggedIn, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !isLoggedIn) navigate({ to: "/login" });
  }, [ready, isLoggedIn, navigate]);

  const { data: blogs, isLoading } = useQuery({
    queryKey: ["blogs"],
    queryFn: getBlogs,
    retry: 1,
    enabled: ready && isLoggedIn,
  });

  const myBlogs = useMemo(() => {
    if (!user) return [];
    return (blogs ?? []).filter((b) => isBlogOwner(b, user));
  }, [blogs, user]);

  const totalWords = myBlogs.reduce(
    (sum, b) => sum + b.content.trim().split(/\s+/).length,
    0,
  );

  if (!ready || !isLoggedIn) {
    return (
      <PageShell>
        <Spinner label="Loading" />
      </PageShell>
    );
  }

  const stats = [
    { icon: BookOpen, label: "My Blogs", value: myBlogs.length },
    { icon: PenLine, label: "Words Written", value: totalWords.toLocaleString() },
    {
      icon: Clock,
      label: "Reading Time",
      value: `${Math.max(0, Math.round(totalWords / 200))} min`,
    },
    { icon: Flame, label: "Community Blogs", value: (blogs ?? []).length },
  ];

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-between gap-4 py-6"
        >
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <h1 className="truncate font-display text-3xl font-bold sm:text-4xl">
              {user?.name || user?.username || "Writer"} <span className="text-gradient">✦</span>
            </h1>
          </div>
          <Link
            to="/create"
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105"
          >
            <PenLine size={17} /> Create Blog
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="rounded-3xl glass hover-lift p-6"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15">
                <s.icon size={18} className="text-primary" />
              </span>
              <p className="mt-4 font-display text-3xl font-bold">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* My blogs */}
        <div className="mt-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold">My Blogs</h2>
            <Link
              to="/blogs"
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80"
            >
              Explore all <ArrowRight size={15} />
            </Link>
          </div>

          {isLoading ? (
            <Spinner label="Loading your blogs" />
          ) : myBlogs.length === 0 ? (
            <div className="rounded-3xl glass p-10 text-center">
              <p className="font-display text-lg font-semibold">No blogs yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Your first story is one quiet moment away.
              </p>
              <Link
                to="/create"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
              >
                <PenLine size={16} /> Start Writing
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myBlogs.map((blog, i) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <Link
                    to="/blogs/$id"
                    params={{ id: blog._id }}
                    className="flex items-center gap-4 rounded-3xl glass p-5 transition-all hover:border-primary/40 hover:bg-glass"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-display font-semibold">{blog.title}</h3>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {excerpt(blog.content, 100)}
                      </p>
                    </div>
                    <div className="hidden shrink-0 text-right text-xs text-muted-foreground sm:block">
                      <p>{formatDate(blog.createdAt)}</p>
                      <p className="mt-1">{readingTime(blog.content)}</p>
                    </div>
                    <ArrowRight size={16} className="shrink-0 text-muted-foreground" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="mt-12">
          <h2 className="mb-5 font-display text-2xl font-semibold">Recent Activity</h2>
          <div className="rounded-3xl glass p-6">
            {myBlogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Activity will appear here once you publish your first blog.
              </p>
            ) : (
              <ul className="space-y-4">
                {myBlogs.slice(0, 5).map((blog) => (
                  <li key={blog._id} className="flex items-center gap-3 text-sm">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <span className="min-w-0 flex-1 truncate">
                      Published <strong>{blog.title}</strong>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(blog.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}