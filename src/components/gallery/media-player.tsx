import { useEffect, useRef, useState, type PointerEvent } from "react"
import { motion } from "motion/react"
import { RotateCcw, RotateCw } from "lucide-react"
import { springs } from "@/springs"

const DURATION = 204

// Each glyph is two 4-point shapes so the paths interpolate point for point.
const quad = (pts: number[][]) => `M${pts.map((p) => p.join(" ")).join(" L")} Z`
const glyphs = {
  pause: [quad([[6, 5], [10, 5], [10, 19], [6, 19]]), quad([[14, 5], [18, 5], [18, 19], [14, 19]])],
  play: [quad([[7, 4.5], [13, 8.25], [13, 15.75], [7, 19.5]]), quad([[13, 8.25], [19, 12], [19, 12], [13, 15.75]])],
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`

export function MediaPlayer() {
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(71)
  const [scrubbing, setScrubbing] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!playing || scrubbing) return
    let last = performance.now()
    let raf = requestAnimationFrame(function tick(now) {
      setTime((t) => (t + (now - last) / 1000) % DURATION)
      last = now
      raf = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(raf)
  }, [playing, scrubbing])

  const seek = (e: PointerEvent) => {
    const rect = barRef.current!.getBoundingClientRect()
    setTime(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)) * DURATION)
  }
  const skip = (delta: number) => setTime((t) => Math.min(DURATION, Math.max(0, t + delta)))
  const shape = playing ? glyphs.pause : glyphs.play

  return (
    <div className="w-full max-w-[300px] rounded-[24px] border border-border bg-card p-3">
      <div className="flex items-center gap-3">
        <div aria-hidden className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-accent">
          <div className="absolute -right-3 -bottom-3 size-10 rounded-full bg-accent-foreground/90" />
          <div className="absolute top-2.5 left-2.5 h-1.5 w-5 rounded-full bg-accent-foreground/90" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium tracking-[-0.01em]">Soft Machinery</p>
          <p className="truncate text-sm text-muted-foreground">Halden Row</p>
        </div>
      </div>

      <div
        ref={barRef}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={DURATION}
        aria-valuenow={Math.floor(time)}
        aria-valuetext={fmt(time)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") skip(5)
          if (e.key === "ArrowLeft") skip(-5)
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          setScrubbing(true)
          seek(e)
        }}
        onPointerMove={(e) => scrubbing && seek(e)}
        onPointerUp={() => setScrubbing(false)}
        onPointerCancel={() => setScrubbing(false)}
        className="mt-4 flex h-6 cursor-pointer items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ touchAction: "none" }}
      >
        <motion.div
          animate={{ height: scrubbing ? 10 : 4 }}
          transition={springs.snappy}
          className="relative w-full overflow-hidden rounded-full bg-muted"
        >
          <div className="absolute inset-y-0 left-0 bg-accent" style={{ width: `${(time / DURATION) * 100}%` }} />
        </motion.div>
      </div>
      <div className="mt-1 flex justify-between font-mono text-xs text-muted-foreground tabular-nums">
        <span>{fmt(time)}</span>
        <span>-{fmt(DURATION - time)}</span>
      </div>

      <div className="mt-1 flex items-center justify-center gap-4">
        <button aria-label="Back 10 seconds" onClick={() => skip(-10)} className="grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground">
          <RotateCcw size={18} />
        </button>
        <button
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => setPlaying((p) => !p)}
          className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
            {shape.map((d, i) => (
              <motion.path key={i} initial={false} animate={{ d }} transition={springs.snappy} />
            ))}
          </svg>
        </button>
        <button aria-label="Forward 10 seconds" onClick={() => skip(10)} className="grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground">
          <RotateCw size={18} />
        </button>
      </div>
    </div>
  )
}
