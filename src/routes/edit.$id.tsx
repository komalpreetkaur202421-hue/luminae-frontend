import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getBlog, updateBlog } from "@/lib/api";
import { useAuth, isBlogOwner } from "@/lib/auth";
import { BlogEditor, type BlogDraft } from "@/components/BlogEditor";
import { PageShell, Spinner } from "@/components/PageShell";

export const Route = createFileRoute("/edit/$id")({
  head: () => ({
    meta: [
      { title: "Edit Blog — Luminae" },
      { name: "description", content: "Edit your blog with a live Markdown preview." },
    ],
  }),
  component: EditBlogPage,
});

function EditBlogPage() {
  const { id } = Route.useParams();
  const { isLoggedIn, ready, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && !isLoggedIn) navigate({ to: "/login" });
  }, [ready, isLoggedIn, navigate]);

  const { data: blog, isLoading } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => getBlog(id),
    retry: 1,
  });

  useEffect(() => {
    if (ready && isLoggedIn && blog && !isBlogOwner(blog, user)) {
      navigate({ to: "/blogs/$id", params: { id } });
    }
  }, [ready, isLoggedIn, blog, user, navigate, id]);

  const saveMutation = useMutation({
    mutationFn: (draft: BlogDraft) => updateBlog(id, draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", id] });
      navigate({ to: "/blogs/$id", params: { id } });
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || "Failed to save changes.");
    },
  });

  if (isLoading || !blog) {
    return (
      <PageShell>
        <Spinner label="Loading blog" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto mb-8 max-w-7xl px-4 sm:px-6"
      >
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Refine your <span className="text-gradient">story</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Every rewrite makes it clearer.</p>
      </motion.div>

      <BlogEditor
        initial={blog}
        submitting={saveMutation.isPending}
        error={error}
        onPublish={(draft) => saveMutation.mutate(draft)}
        onSaveDraft={(draft) => saveMutation.mutate(draft)}
      />
    </PageShell>
  );
}