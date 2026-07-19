import { useState } from "react";
import { motion } from "framer-motion";
import { Palette, Save, Send, Image as ImageIcon } from "lucide-react";
import { MarkdownPreview } from "./MarkdownPreview";
import { BLOG_THEMES, CATEGORIES, getTheme } from "@/lib/blog-utils";
import type { Blog } from "@/lib/api";

export interface BlogDraft {
  title: string;
  content: string;
  category: string;
  coverImage: string;
  theme: string;
}

interface BlogEditorProps {
  initial?: Partial<Blog>;
  submitting: boolean;
  error?: string;
  onPublish: (draft: BlogDraft) => void;
  onSaveDraft: (draft: BlogDraft) => void;
}

const SAMPLE = `# Your story starts here

Write in **Markdown** — headings, *italic*, lists, quotes and more.

> Every idea deserves a beautiful place to grow.

- Calm
- Focused
- Distraction-free

\`\`\`js
const inspiration = "flows";
\`\`\`
`;

export function BlogEditor({ initial, submitting, error, onPublish, onSaveDraft }: BlogEditorProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Writing");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [themeId, setThemeId] = useState(initial?.theme ?? "midnight-glass");

  const theme = getTheme(themeId);
  const draft: BlogDraft = { title, content, category, coverImage, theme: themeId };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Blog title…"
          className="min-w-0 flex-1 rounded-2xl border border-glass-border bg-input px-5 py-3.5 font-display text-lg font-semibold outline-none backdrop-blur-xl transition-all placeholder:text-muted-foreground/60 focus:border-primary/60"
        />
        <button
          onClick={() => onSaveDraft(draft)}
          disabled={submitting || !title.trim()}
          className="flex shrink-0 items-center gap-2 rounded-2xl glass px-5 py-3.5 text-sm font-semibold transition-transform hover:scale-105 disabled:opacity-40"
        >
          <Save size={16} /> Save Draft
        </button>
        <button
          onClick={() => onPublish(draft)}
          disabled={submitting || !title.trim() || !content.trim()}
          className="flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 disabled:opacity-40"
        >
          <Send size={16} /> {submitting ? "Publishing…" : "Publish"}
        </button>
      </div>

      {/* Meta row */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-2xl border border-glass-border bg-input px-4 py-2.5 backdrop-blur-xl">
          <ImageIcon size={16} className="shrink-0 text-muted-foreground" />
          <input
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="Cover image URL (optional)"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.filter((c) => c !== "All").map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                category === c
                  ? "bg-primary text-primary-foreground"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Split editor */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl glass p-1.5">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={SAMPLE}
            spellCheck={false}
            className="h-[60vh] w-full resize-none rounded-[20px] bg-transparent p-5 font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground/40"
          />
        </div>

        <div className="space-y-4">
          {/* Theme selector */}
          <div className="rounded-3xl glass p-4">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Palette size={14} /> Blog Theme
            </p>
            <div className="flex flex-wrap gap-2">
              {BLOG_THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setThemeId(t.id)}
                  className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    themeId === t.id
                      ? "bg-primary text-primary-foreground scale-105"
                      : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-full border border-white/30"
                    style={{ background: t.accent }}
                  />
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Live themed preview */}
          <motion.div
            key={themeId}
            initial={{ opacity: 0.6, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="h-[52vh] overflow-y-auto rounded-3xl border border-glass-border p-6 sm:p-8"
            style={{ background: theme.background, color: theme.text, fontFamily: theme.fontFamily }}
          >
            <div
              className="rounded-3xl p-6 backdrop-blur-xl sm:p-8"
              style={{ background: theme.cardBg, border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {title && (
                <h1 className="mb-1 font-display text-2xl font-bold" style={{ color: theme.text }}>
                  {title}
                </h1>
              )}
              {title && (
                <div className="mb-5 h-0.5 w-14 rounded-full" style={{ background: theme.accent }} />
              )}
              <MarkdownPreview content={content || "*Start typing to see your live preview…*"} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}