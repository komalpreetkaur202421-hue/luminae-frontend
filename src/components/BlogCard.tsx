import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, User } from "lucide-react";
import type { Blog } from "@/lib/api";
import { authorName, excerpt, formatDate, readingTime } from "@/lib/blog-utils";

export function BlogCard({ blog, index = 0 }: { blog: Blog; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.07, ease: "easeOut" }}
      className="group rounded-3xl glass hover-lift overflow-hidden"
    >
      <Link to="/blogs/$id" params={{ id: blog._id }} className="flex h-full flex-col">
        {blog.coverImage && (
          <div className="h-44 overflow-hidden">
            <img
              src={blog.coverImage}
              alt={blog.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-3 p-6">
          {blog.category && (
            <span className="w-fit rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              {blog.category}
            </span>
          )}
          <h3 className="font-display text-xl font-semibold leading-snug transition-colors group-hover:text-primary">
            {blog.title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {excerpt(blog.content)}
          </p>
          <div className="mt-auto flex items-center gap-4 pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User size={13} /> {authorName(blog)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} /> {readingTime(blog.content)}
            </span>
            {blog.createdAt && <span className="ml-auto">{formatDate(blog.createdAt)}</span>}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}