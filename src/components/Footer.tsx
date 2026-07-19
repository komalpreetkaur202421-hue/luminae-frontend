import { Link } from "@tanstack/react-router";
import { Feather } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-glass-border bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-12 text-center">
        <div className="flex items-center gap-2">
          <Feather size={18} className="text-primary" />
          <span className="font-display text-lg font-semibold">Luminae</span>
        </div>
        <p className="max-w-md font-display text-lg italic text-muted-foreground">
          "Every great story begins with a single word."
        </p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
          <Link to="/blogs" className="transition-colors hover:text-foreground">Blogs</Link>
          <Link to="/create" className="transition-colors hover:text-foreground">Write</Link>
        </div>
        <p className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} Luminae. Write without fear.
        </p>
      </div>
    </footer>
  );
}