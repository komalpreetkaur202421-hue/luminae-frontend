import type { Blog } from "./api";

/** Estimated reading time based on ~200 words per minute. */
export function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

/** Strip markdown syntax for a plain-text excerpt. */
export function excerpt(content: string, length = 140): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_`~\[\]()!-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > length ? plain.slice(0, length) + "…" : plain;
}

export function authorName(blog: Blog): string {
  if (!blog.author) return "Anonymous";
  if (typeof blog.author === "string") return "Author";
  return blog.author.name || blog.author.username || "Author";
}

export function authorId(blog: Blog): string | null {
  if (!blog.author) return null;
  return typeof blog.author === "string" ? blog.author : blog.author._id;
}

export function formatDate(date?: string): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ---------------- Blog themes ---------------- */

export interface BlogTheme {
  id: string;
  name: string;
  /** Inline style variables applied to the themed preview / article. */
  background: string;
  cardBg: string;
  text: string;
  accent: string;
  fontFamily: string;
}

export const BLOG_THEMES: BlogTheme[] = [
  {
    id: "midnight-glass",
    name: "Midnight Glass",
    background: "linear-gradient(160deg, #0b1120 0%, #101a33 100%)",
    cardBg: "rgba(255,255,255,0.06)",
    text: "#e8edf5",
    accent: "#5eead4",
    fontFamily: "'Outfit', sans-serif",
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    background: "linear-gradient(160deg, #05202e 0%, #0a3d4d 100%)",
    cardBg: "rgba(255,255,255,0.08)",
    text: "#e6f7fb",
    accent: "#38bdf8",
    fontFamily: "'Manrope', sans-serif",
  },
  {
    id: "forest-calm",
    name: "Forest Calm",
    background: "linear-gradient(160deg, #0d1f15 0%, #16341f 100%)",
    cardBg: "rgba(255,255,255,0.07)",
    text: "#eaf5ec",
    accent: "#4ade80",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  {
    id: "golden-sunrise",
    name: "Golden Sunrise",
    background: "linear-gradient(160deg, #1f1408 0%, #3a2410 100%)",
    cardBg: "rgba(255,235,200,0.08)",
    text: "#fbf3e4",
    accent: "#fbbf24",
    fontFamily: "'Outfit', sans-serif",
  },
  {
    id: "minimal-paper",
    name: "Minimal Paper",
    background: "linear-gradient(160deg, #f7f5f0 0%, #efece4 100%)",
    cardBg: "rgba(255,255,255,0.8)",
    text: "#22252b",
    accent: "#0d9488",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
];

export function getTheme(id?: string): BlogTheme {
  return BLOG_THEMES.find((t) => t.id === id) ?? BLOG_THEMES[0];
}

export const CATEGORIES = [
  "All",
  "Technology",
  "Design",
  "Travel",
  "Lifestyle",
  "Writing",
  "Nature",
  "Ideas",
];