import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PenLine, Compass, Sparkles, Feather, Moon, Palette } from "lucide-react";
import { CinematicHero } from "@/components/CinematicHero";

export const Route = createFileRoute("/")({
  component: Landing,
});

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

function Landing() {
  return (
    <div>
      <CinematicHero>
        <div className="grid w-full items-center gap-12 py-28 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left — headline */}
          <div>
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-gold"
            >
              <Sparkles size={15} /> A calmer place to write
            </motion.p>
            <motion.h1
              {...fadeUp}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-display text-5xl font-bold leading-[1.08] sm:text-6xl lg:text-7xl"
            >
              Write without fear.
              <br />
              <span className="text-gradient">Think without limits.</span>
            </motion.h1>
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-6 max-w-lg text-lg leading-relaxed text-foreground/80"
            >
              Every idea deserves a beautiful place to grow. Write blogs using
              Markdown in a peaceful, distraction-free environment.
            </motion.p>
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-9 flex flex-wrap gap-4"
            >
              <Link
                to="/create"
                className="flex items-center gap-2 rounded-2xl bg-primary px-7 py-3.5 font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                <PenLine size={18} /> Start Writing
              </Link>
              <Link
                to="/blogs"
                className="flex items-center gap-2 rounded-2xl glass px-7 py-3.5 font-semibold transition-all hover:scale-105"
              >
                <Compass size={18} /> Explore Blogs
              </Link>
            </motion.div>
          </div>

          {/* Right — floating glass blog preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="hidden lg:block"
          >
            <div className="animate-float-slow rounded-3xl glass-strong p-8">
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                Nature
              </span>
              <h3 className="mt-4 font-display text-2xl font-semibold leading-snug">
                The Morning the Lake Taught Me Stillness
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Before sunrise, the water holds its breath. In that silence I
                found the first sentence I'd been chasing for a year…
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-glass-border pt-5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  A
                </span>
                <div>
                  <p className="text-sm font-semibold">Aria Bennett</p>
                  <p className="text-xs text-muted-foreground">4 min read · Dawn Journal</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </CinematicHero>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center font-display text-3xl font-bold sm:text-4xl"
        >
          Designed for deep, calm writing
        </motion.h2>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Feather,
              title: "Markdown, beautifully",
              text: "Headings, quotes, code and tables — rendered elegantly as you type, with an instant live preview.",
            },
            {
              icon: Palette,
              title: "Five serene themes",
              text: "Midnight Glass, Ocean Breeze, Forest Calm, Golden Sunrise and Minimal Paper — your words, your mood.",
            },
            {
              icon: Moon,
              title: "Distraction-free",
              text: "A quiet, cinematic space with nothing between you and the page. Just you and the next sentence.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className="rounded-3xl glass hover-lift p-8"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15">
                <f.icon size={22} className="text-primary" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
