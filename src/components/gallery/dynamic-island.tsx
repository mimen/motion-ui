import { useEffect, useState, type ComponentType } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Phone, PhoneOff, Timer } from "lucide-react"
import { springs } from "@/springs"
import { cn } from "@/lib/utils"

function Compact() {
  return (
    <div className="flex h-full items-center justify-between px-3">
      <span className="size-2 rounded-full bg-accent" />
      <span className="size-2.5 rounded-full bg-white/10" />
    </div>
  )
}

function Call() {
  return (
    <div className="flex h-full items-center gap-3 px-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15 text-sm font-medium">MA</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-white/50">Incoming call</p>
        <p className="truncate text-sm font-medium">Maya Arden</p>
      </div>
      <span className="grid size-10 place-items-center rounded-full bg-white/15"><PhoneOff /></span>
      <span className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground"><Phone /></span>
    </div>
  )
}

function Countdown() {
  const [left, setLeft] = useState(299)
  useEffect(() => {
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 299)), 1000)
    return () => clearInterval(id)
  }, [])
  const r = 9
  const c = 2 * Math.PI * r
  return (
    <div className="flex h-full items-center justify-between px-3">
      <span className="flex items-center gap-2 text-white/60"><Timer /> <span className="text-xs">Timer</span></span>
      <span className="flex items-center gap-2">
        <span className="font-mono text-base tabular-nums">
          {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
        </span>
        <svg viewBox="0 0 24 24" className="size-6 -rotate-90" aria-hidden>
          <circle cx={12} cy={12} r={r} fill="none" stroke="rgb(255 255 255 / 0.15)" strokeWidth={2.5} />
          <motion.circle
            cx={12} cy={12} r={r} fill="none" className="stroke-accent" strokeWidth={2.5} strokeLinecap="round"
            strokeDasharray={c}
            animate={{ strokeDashoffset: c * (1 - left / 299) }}
            transition={springs.smooth}
          />
        </svg>
      </span>
    </div>
  )
}

function Music() {
  return (
    <div className="flex h-full items-center gap-3 px-3">
      <div className="size-10 shrink-0 rounded-lg bg-accent" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">Soft Machinery</p>
        <p className="truncate text-xs text-white/50">Halden Row</p>
      </div>
      <div className="flex h-5 items-end gap-[3px]" aria-hidden>
        {[0.5, 0.9, 0.35, 0.75].map((peak, i) => (
          <motion.span
            key={i}
            className="w-[3px] rounded-full bg-accent"
            animate={{ height: ["20%", `${peak * 100}%`, "35%", "100%", "20%"] }}
            transition={{ duration: 1.1 + i * 0.17, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  )
}

type IslandState = { id: string; label: string; width: number; height: number; radius: number; Content: ComponentType }

const states: IslandState[] = [
  { id: "compact", label: "Idle", width: 120, height: 34, radius: 17, Content: Compact },
  { id: "call", label: "Call", width: 320, height: 64, radius: 32, Content: Call },
  { id: "timer", label: "Timer", width: 220, height: 44, radius: 22, Content: Countdown },
  { id: "music", label: "Music", width: 300, height: 64, radius: 24, Content: Music },
]

export function DynamicIsland() {
  const [index, setIndex] = useState(0)
  const { id, width, height, radius, Content } = states[index]

  return (
    <div className="flex h-full w-full flex-col items-center justify-between py-8">
      <motion.button
        aria-label={`Dynamic island, ${states[index].label}. Tap for next state`}
        onClick={() => setIndex((i) => (i + 1) % states.length)}
        initial={false}
        animate={{ width, height, borderRadius: radius }}
        transition={springs.smooth}
        style={{ colorScheme: "dark" }}
        className="relative max-w-full overflow-hidden bg-black text-left text-white outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={id}
            initial={{ opacity: 0, filter: "blur(4px)", scale: 0.96 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1, transition: { ...springs.smooth, delay: 0.08 } }}
            exit={{ opacity: 0, filter: "blur(4px)", scale: 0.96, transition: { type: "tween", duration: 0.1 } }}
            className="absolute inset-0"
            style={{ width }}
          >
            <Content />
          </motion.div>
        </AnimatePresence>
      </motion.button>

      <div role="tablist" aria-label="Island state" className="flex rounded-full border border-border bg-card p-1">
        {states.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === index}
            onClick={() => setIndex(i)}
            className={cn(
              "relative h-10 rounded-full px-3.5 text-sm transition-colors",
              i === index ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {i === index && (
              <motion.span layoutId="island-segment" transition={springs.snappy} className="absolute inset-0 rounded-full bg-primary" />
            )}
            <span className="relative">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
