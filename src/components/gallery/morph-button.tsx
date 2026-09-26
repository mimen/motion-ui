import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import { springs } from "@/springs"

type Phase = "idle" | "loading" | "success"

const phases: Record<Phase, { width: number; accent: number; label: string; next?: [Phase, number] }> = {
  idle: { width: 148, accent: 0, label: "Deploy" },
  loading: { width: 52, accent: 1, label: "Deploying", next: ["success", 1200] },
  success: { width: 52, accent: 1, label: "Deployed", next: ["idle", 900] },
}

const swap = {
  initial: { opacity: 0, filter: "blur(4px)", scale: 0.8 },
  animate: { opacity: 1, filter: "blur(0px)", scale: 1 },
  exit: { opacity: 0, filter: "blur(4px)", scale: 0.8 },
  transition: springs.snappy,
}

export function MorphButton() {
  const [phase, setPhase] = useState<Phase>("idle")
  const { width, accent, label, next } = phases[phase]

  useEffect(() => {
    if (!next) return
    const id = setTimeout(() => setPhase(next[0]), next[1])
    return () => clearTimeout(id)
  }, [next])

  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-live="polite"
      disabled={phase !== "idle"}
      onClick={() => setPhase("loading")}
      initial={false}
      animate={{ width }}
      transition={springs.smooth}
      whileTap={phase === "idle" ? { scale: 0.97 } : undefined}
      className="relative flex h-[52px] items-center justify-center overflow-hidden rounded-full bg-primary text-[15px] font-medium tracking-[-0.01em] text-primary-foreground outline-offset-4 disabled:cursor-default"
    >
      <motion.span
        aria-hidden
        className="absolute inset-0 bg-accent"
        initial={false}
        animate={{ opacity: accent }}
        transition={springs.smooth}
      />
      <AnimatePresence mode="popLayout" initial={false}>
        {phase === "idle" && (
          <motion.span key="idle" {...swap} className="relative flex items-center gap-1.5 whitespace-nowrap">
            Deploy
            <ArrowUpRight className="opacity-60" />
          </motion.span>
        )}
        {phase === "loading" && (
          <motion.span key="loading" {...swap} className="relative text-accent-foreground">
            <motion.svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            >
              <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.75" />
              <path d="M11 2.5a8.5 8.5 0 0 1 8.5 8.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </motion.svg>
          </motion.span>
        )}
        {phase === "success" && (
          <motion.span key="success" {...swap} className="relative text-accent-foreground">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <motion.path
                d="M6 11.5l3.5 3.5L16 8"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={springs.smooth}
              />
            </svg>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
