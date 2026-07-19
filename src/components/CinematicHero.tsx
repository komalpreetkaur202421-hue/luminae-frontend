import { useEffect, useMemo, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import heroLake from "@/assets/hero-lake.jpg";

/**
 * Full-screen cinematic hero: slow-zooming lake, drifting fog layers,
 * shimmering water light, floating particles, and scroll parallax.
 */
export function CinematicHero({ children }: { children: ReactNode }) {
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 800], [0, 160]);
  const contentY = useTransform(scrollY, [0, 600], [0, -60]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: `${(i * 53) % 100}%`,
        size: 2 + ((i * 7) % 4),
        delay: (i * 1.7) % 14,
        duration: 14 + ((i * 3) % 10),
      })),
    [],
  );

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background image with slow zoom + parallax */}
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <img
          src={heroLake}
          alt="Peaceful mountain lake at sunrise"
          width={1920}
          height={1088}
          className="h-[115%] w-full object-cover animate-slow-zoom"
        />
      </motion.div>

      {/* Water shimmer */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3 animate-shimmer"
        style={{
          background:
            "linear-gradient(180deg, transparent, oklch(0.82 0.11 85 / 12%))",
        }}
      />

      {/* Fog layers */}
      <div
        className="absolute inset-x-[-10%] bottom-[18%] h-40 animate-fog rounded-full blur-3xl"
        style={{ background: "oklch(0.9 0.02 240 / 14%)" }}
      />
      <div
        className="absolute inset-x-[-10%] bottom-[8%] h-32 animate-fog rounded-full blur-3xl"
        style={{ background: "oklch(0.9 0.02 240 / 10%)", animationDelay: "-13s" }}
      />

      {/* Floating particles */}
      {mounted &&
        particles.map((p, i) => (
          <span
            key={i}
            className="absolute bottom-0 rounded-full bg-gold/60"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animation: `particle-rise ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 gradient-hero-overlay" />

      {/* Content */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-4 sm:px-6"
      >
        {children}
      </motion.div>
    </section>
  );
}