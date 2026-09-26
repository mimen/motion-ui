import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "motion/react"
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react"
import { springs } from "@/springs"

const MAX_STRETCH = 28

// iOS-style: resistance grows with distance and the result never passes `limit`.
function rubberBand(overshoot: number, limit: number, c = 0.55) {
  const x = Math.abs(overshoot)
  return Math.sign(overshoot) * limit * (1 - 1 / ((x * c) / limit + 1))
}

const clamp = (v: number) => Math.min(1, Math.max(0, v))

function iconFor(v: number) {
  if (v === 0) return { key: "x", Icon: VolumeX }
  if (v < 0.34) return { key: "0", Icon: Volume }
  if (v < 0.67) return { key: "1", Icon: Volume1 }
  return { key: "2", Icon: Volume2 }
}

export function RubberSlider() {
  const trackRef = useRef<HTMLDivElement>(null)
  const value = useMotionValue(0.62)
  const stretch = useMotionValue(0)
  const [level, setLevel] = useState(0.62)
  useMotionValueEvent(value, "change", setLevel)

  const fillWidth = useTransform(value, (v) => `${v * 100}%`)
  const scaleX = useTransform(stretch, (s) => 1 + Math.abs(s) / (trackRef.current?.offsetWidth ?? 280))
  const scaleY = useTransform(stretch, (s) => 1 - (Math.abs(s) / MAX_STRETCH) * 0.14)
  const originX = useTransform(stretch, (s) => (s < 0 ? 1 : 0))

  const track = (e: PointerEvent) => {
    // Measure the untransformed parent; the track's own rect includes the stretch and would feed back.
    const rect = trackRef.current!.parentElement!.getBoundingClientRect()
    const past = e.clientX > rect.right ? e.clientX - rect.right : e.clientX < rect.left ? e.clientX - rect.left : 0
    value.set(clamp((e.clientX - rect.left) / rect.width))
    stretch.set(rubberBand(past, MAX_STRETCH))
  }

  const onPointerDown = (e: PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    track(e)
  }
  const onPointerMove = (e: PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) track(e)
  }
  const release = () => animate(stretch, 0, springs.smooth)

  const onKeyDown = (e: KeyboardEvent) => {
    const step = { ArrowRight: 0.05, ArrowUp: 0.05, ArrowLeft: -0.05, ArrowDown: -0.05 }[e.key]
    const target = e.key === "Home" ? 0 : e.key === "End" ? 1 : step !== undefined ? clamp(value.get() + step) : null
    if (target === null) return
    e.preventDefault()
    animate(value, Math.round(target * 100) / 100, springs.snappy)
  }

  const percent = Math.round(level * 100)
  const { key, Icon } = iconFor(percent === 0 ? 0 : level)

  return (
    <div className="flex w-full max-w-[280px] flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="relative grid size-4 place-items-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={key}
                initial={{ opacity: 0, filter: "blur(4px)", scale: 0.8 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, filter: "blur(4px)", scale: 0.8 }}
                transition={springs.snappy}
                className="absolute inset-0 grid place-items-center text-foreground"
              >
                <Icon />
              </motion.span>
            </AnimatePresence>
          </span>
          Volume
        </span>
        <span className="font-mono text-sm tabular-nums">{percent}%</span>
      </div>
      <motion.div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={release}
        onKeyDown={onKeyDown}
        style={{ scaleX, scaleY, originX, touchAction: "none" }}
        className="relative h-11 cursor-grab overflow-hidden rounded-full border border-border bg-card outline-none select-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
      >
        <motion.div style={{ width: fillWidth }} className="absolute inset-y-0 left-0 bg-accent" />
      </motion.div>
    </div>
  )
}
