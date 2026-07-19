import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Share2, Pencil, Trash2, Check, User, MessageSquare } from "lucide-react";
import { getBlog, deleteBlog, likeBlog, addComment, deleteComment } from "@/lib/api";
import { authorId, authorName, formatDate, getTheme, readingTime } from "@/lib/blog-utils";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { PageShell, Spinner } from "@/components/PageShell";
import { useAuth, isBlogOwner } from "@/lib/auth";

export const Route = createFileRoute("/blogs/$id")({
  head: () => ({
    meta: [
      { title: "Reading — Luminae" },
      { name: "description", content: "A beautiful reading experience on Luminae." },
    ],
  }),
  component: BlogDetails,
});

function BlogDetails() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  
  // Comments localized states
  const [commentText, setCommentText] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: blog, isLoading, isError } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => getBlog(id),
    retry: 1,
  });

  const removeMutation = useMutation({
    mutationFn: () => deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      navigate({ to: "/blogs" });
    },
  });

  const likeMutation = useMutation({
    mutationFn: () => likeBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog", id] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });

  const addCommentMutation = useMutation({
    // Axios automatically appends the Bearer token header now!
    mutationFn: (text: string) => addComment(id, text), 
    onSuccess: () => {
    setCommentText("");
    setErrorText(null);
    queryClient.invalidateQueries({ queryKey: ["blog", id] });
    },
    onError: (err: any) => {
    // Axios puts backend response payloads inside err.response
    const message = err.response?.data?.message || err.message || "Failed to post comment.";
    setErrorText(message);
  },
});

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(id, commentId),
    onSuccess: () => {
      setConfirmDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["blog", id] });
    },
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: blog?.title, url });
        return;
      } catch {
        /* user cancelled */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      setErrorText("Comment cannot be empty");
      return;
    }
    addCommentMutation.mutate(commentText);
  };

  if (isLoading) {
    return (
      <PageShell>
        <Spinner label="Opening story" />
      </PageShell>
    );
  }

  if (isError || !blog) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-6 text-center">
          <h1 className="font-display text-2xl font-semibold">Story not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This blog may have been removed, or the backend isn't reachable.
          </p>
          <Link
            to="/blogs"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl glass px-6 py-3 text-sm font-semibold"
          >
            <ArrowLeft size={16} /> Back to blogs
          </Link>
        </div>
      </PageShell>
    );
  }

  const theme = getTheme(blog.theme);
  const isOwner = isBlogOwner(blog, user);

  // Newest comments first
  const sortedComments = [...(blog.comments || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <PageShell className="pb-0">
      {/* Cover */}
      {blog.coverImage && (
        <div className="relative -mt-24 h-[55vh] w-full overflow-hidden">
          <img src={blog.coverImage} alt={blog.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 gradient-hero-overlay" />
        </div>
      )}

      <div
        className="pb-20"
        style={{ background: theme.background, color: theme.text, fontFamily: theme.fontFamily }}
      >
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className={`mx-auto max-w-3xl px-4 sm:px-6 ${blog.coverImage ? "-mt-24 relative z-10" : "pt-10"} space-y-8`}
        >
          {/* Main Article Content */}
          <div
            className="rounded-3xl p-7 backdrop-blur-2xl sm:p-12"
            style={{
              background: theme.cardBg,
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 20px 60px -20px rgba(0,0,0,0.5)",
            }}
          >
            <div className="mb-6 flex flex-wrap items-center gap-3 text-xs" style={{ color: theme.text, opacity: 0.75 }}>
              {blog.category && (
                <span
                  className="rounded-full px-3 py-1 font-semibold"
                  style={{ background: `${theme.accent}22`, color: theme.accent }}
                >
                  {blog.category}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <User size={13} /> {authorName(blog)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} /> {readingTime(blog.content)}
              </span>
              {blog.createdAt && <span>{formatDate(blog.createdAt)}</span>}
            </div>

            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
              {blog.title}
            </h1>
            <div className="mt-4 h-1 w-16 rounded-full" style={{ background: theme.accent }} />

            <div className="mt-8">
              <MarkdownPreview content={blog.content} />
            </div>

            {/* Actions */}
            <div
              className="mt-10 flex flex-wrap items-center gap-3 border-t pt-6"
              style={{ borderColor: "rgba(255,255,255,0.12)" }}
            >
              <button
                onClick={() => likeMutation.mutate()}
                disabled={likeMutation.isPending}
                className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-105"
                style={{
                  background: `${theme.accent}22`,
                  color: theme.accent,
                }}
              >
                ❤️ {blog.likes?.length ?? 0}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-105"
                style={{ background: `${theme.accent}22`, color: theme.accent }}
              >
                {copied ? <Check size={15} /> : <Share2 size={15} />}
                {copied ? "Link copied" : "Share"}
              </button>

              {isOwner && (
                <>
                  <Link
                    to="/edit/$id"
                    params={{ id: blog._id }}
                    className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-105"
                    style={{ background: "rgba(255,255,255,0.1)", color: theme.text }}
                  >
                    <Pencil size={15} /> Edit
                  </Link>
                  <button
                    onClick={() => (confirming ? removeMutation.mutate() : setConfirming(true))}
                    disabled={removeMutation.isPending}
                    className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-destructive transition-transform hover:scale-105 disabled:opacity-50"
                    style={{ background: "rgba(220,60,60,0.12)" }}
                  >
                    <Trash2 size={15} />
                    {removeMutation.isPending
                      ? "Deleting…"
                      : confirming
                        ? "Confirm delete?"
                        : "Delete"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div
            className="rounded-3xl p-7 backdrop-blur-2xl sm:p-12 space-y-8"
            style={{
              background: theme.cardBg,
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 20px 60px -20px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex items-center gap-3 border-b pb-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <h2 className="text-xl font-bold tracking-tight">Comments</h2>
              <span 
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{ background: `${theme.accent}22`, color: theme.accent }}
              >
                {blog.comments?.length ?? 0}
              </span>
            </div>

            {/* Comment Input Form */}
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div 
                className="rounded-2xl border transition-all duration-300 p-1 bg-black/20"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                <textarea
                  rows={4}
                  value={commentText}
                  onChange={(e) => {
                    setCommentText(e.target.value);
                    if (errorText) setErrorText(null);
                  }}
                  disabled={addCommentMutation.isPending}
                  placeholder="Write a thoughtful comment..."
                  className="w-full bg-transparent border-0 resize-none px-4 py-3 text-sm focus:ring-0 focus:outline-none placeholder-muted-foreground/60"
                  style={{ color: theme.text }}
                />
              </div>

              <div className="flex items-center justify-between min-h-[40px]">
                {errorText ? (
                  <p className="text-sm font-medium text-destructive animate-pulse">{errorText}</p>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  disabled={addCommentMutation.isPending}
                  className="rounded-2xl px-6 py-2.5 font-semibold text-sm transition-transform hover:scale-105 disabled:opacity-50 text-white"
                  style={{ background: theme.accent }}
                >
                  {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>

            {/* Comments Stream List */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {sortedComments.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-10 rounded-2xl border border-dashed border-muted-foreground/20 bg-black/10 text-muted-foreground/70"
                  >
                    <p className="font-semibold text-sm">No comments yet.</p>
                    <p className="text-xs mt-1">Be the first to start the conversation.</p>
                  </motion.div>
                ) : (
                  sortedComments.map((comment, index) => {
                    const isCommentOwner = comment.user?._id === user?.id || comment.user?._id === user?._id;

                    return (
                      <motion.div
                        key={comment._id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.28, delay: Math.min(index * 0.05, 0.3) }}
                        className="p-5 rounded-2xl border flex gap-4 transition-colors duration-300 relative group bg-black/10"
                        style={{ borderColor: "rgba(255,255,255,0.06)" }}
                      >
                        {/* Avatar */}
                        <div 
                          className="h-10 w-10 shrink-0 rounded-xl border flex items-center justify-center font-semibold uppercase tracking-wider text-sm shadow-inner"
                          style={{ background: `${theme.accent}15`, borderColor: `${theme.accent}30`, color: theme.accent }}
                        >
                          {comment.user?.name ? comment.user.name.charAt(0) : "?"}
                        </div>

                        {/* Content block stack */}
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-baseline gap-2 min-w-0">
                              <span className="font-semibold text-sm truncate" style={{ color: theme.text }}>
                                {comment.user?.name || "Anonymous"}
                              </span>
                              <span className="text-[11px] opacity-50 whitespace-nowrap">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>

                            {/* Deletion Check and Interface Toggle */}
                            {isCommentOwner && (
                              <div className="flex items-center">
                                {confirmDeleteId === comment._id ? (
                                  <div className="flex items-center gap-2 text-xs bg-black/40 border border-destructive/30 px-2.5 py-1 rounded-xl">
                                    <span className="text-destructive font-semibold">Delete comment?</span>
                                    <button
                                      onClick={() => deleteCommentMutation.mutate(comment._id)}
                                      className="text-destructive hover:underline font-bold"
                                    >
                                      Confirm
                                    </button>
                                    <span className="opacity-30">|</span>
                                    <button
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="opacity-70 hover:opacity-100"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setConfirmDeleteId(comment._id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    title="Delete comment"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap opacity-90" style={{ color: theme.text }}>
                            {comment.text}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.article>
      </div>
    </PageShell>
  );
}