import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Consistent fade/slide page transition wrapper with navbar offset. */
export function PageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`min-h-screen pt-24 pb-20 ${className}`}
    >
      {children}
    </motion.main>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-glass-border border-t-primary" />
      <p className="text-sm text-muted-foreground">{label}…</p>
    </div>
  );
}