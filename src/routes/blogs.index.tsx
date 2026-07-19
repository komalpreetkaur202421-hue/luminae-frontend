import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, CloudOff } from "lucide-react";
import { getBlogs } from "@/lib/api";
import { CATEGORIES } from "@/lib/blog-utils";
import { BlogCard } from "@/components/BlogCard";
import { PageShell, Spinner } from "@/components/PageShell";

export const Route = createFileRoute("/blogs/")({
  head: () => ({
    meta: [
      { title: "Explore Blogs — Luminae" },
      { name: "description", content: "Discover beautiful stories and ideas written on Luminae." },
      { property: "og:title", content: "Explore Blogs — Luminae" },
      { property: "og:description", content: "Discover beautiful stories and ideas written on Luminae." },
    ],
  }),
  component: BlogsPage,
});

const PER_PAGE = 9;

function BlogsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);

  const { data: blogs, isLoading, isError } = useQuery({
    queryKey: ["blogs"],
    queryFn: getBlogs,
    retry: 1,
  });

  const filtered = useMemo(() => {
    let list = blogs ?? [];
    if (category !== "All") list = list.filter((b) => b.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) => b.title.toLowerCase().includes(q) || b.content.toLowerCase().includes(q),
      );
    }
    return list;
  }, [blogs, category, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const featured = (blogs ?? []).slice(0, 1)[0];

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-10 text-center"
        >
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            Stories worth <span className="text-gradient">savoring</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Fresh ideas, quiet essays and beautiful thinking from writers around the world.
          </p>
        </motion.div>

        {/* Search + categories */}
        <div className="mb-10 space-y-5">
          <div className="mx-auto flex max-w-xl items-center gap-3 rounded-2xl glass px-5 py-3.5">
            <Search size={18} className="shrink-0 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search blogs…"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCategory(c);
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  category === c
                    ? "bg-primary text-primary-foreground scale-105"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <Spinner label="Fetching blogs" />}

        {isError && (
          <div className="mx-auto max-w-md rounded-3xl glass p-10 text-center">
            <CloudOff size={32} className="mx-auto text-muted-foreground" />
            <h2 className="mt-4 font-display text-xl font-semibold">Backend not connected</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Couldn't reach <code className="text-primary">GET /api/blogs</code>. Start your
              Express server and set <code className="text-primary">VITE_API_URL</code> to its URL.
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* Featured */}
            {featured && category === "All" && !search && page === 1 && (
              <div className="mb-10">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                  Featured
                </p>
                <BlogCard blog={featured} />
              </div>
            )}

            {pageItems.length === 0 ? (
              <p className="py-16 text-center text-muted-foreground">
                No blogs found. Be the first to write one.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pageItems.map((blog, i) => (
                  <BlogCard key={blog._id} blog={blog} index={i} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="grid h-10 w-10 place-items-center rounded-full glass transition-transform hover:scale-110 disabled:opacity-30"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="grid h-10 w-10 place-items-center rounded-full glass transition-transform hover:scale-110 disabled:opacity-30"
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}