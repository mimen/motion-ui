import { useRef, useState, type PointerEvent } from "react"
import { AnimatePresence, motion, useFollowValue, useInView, useMotionValue, useTransform } from "motion/react"
import { springs } from "@/springs"

const W = 320
const H = 132
const PAD = 8

const data = [
  18.2, 19.1, 18.6, 20.4, 21.9, 21.2, 23.5, 22.8, 24.9, 26.3, 25.1, 27.4,
  29.8, 28.6, 30.2, 32.9, 31.5, 33.8, 36.1, 34.7, 37.9, 39.2, 38.4, 41.6,
]
const max = 44
const xAt = (i: number) => (i / (data.length - 1)) * W
const yAt = (v: number) => PAD + (1 - v / max) * (H - PAD * 2)
const line = data.map((v, i) => `${i ? "L" : "M"}${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(" ")
const area = `${line} L${W} ${H} L0 ${H} Z`
const total = data.reduce((a, b) => a + b, 0)
const delta = ((data.at(-1)! - data.at(-2)!) / data.at(-2)!) * 100

const money = (k: number) => `$${k.toFixed(1)}k`

export function DrawingChart() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [index, setIndex] = useState<number | null>(null)

  const target = useMotionValue(xAt(data.length - 1))
  const targetY = useMotionValue(yAt(data.at(-1)!))
  const x = useFollowValue(target, springs.snappy)
  const y = useFollowValue(targetY, springs.snappy)
  const left = useTransform(x, (v) => `${(v / W) * 100}%`)
  // Sits right of the guide at the start and slides to its left by the end, so it never covers the dot at the edges.
  const tipX = useTransform(x, (v) => {
    const p = Math.min(1, Math.max(0, v / W))
    return `calc(${-p * 100}% + ${12 - 24 * p}px)`
  })

  const point = (e: PointerEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    const i = Math.round(((e.clientX - rect.left) / rect.width) * (data.length - 1))
    const clamped = Math.min(data.length - 1, Math.max(0, i))
    target.set(xAt(clamped))
    targetY.set(yAt(data[clamped]))
    if (index === null) {
      x.jump(xAt(clamped))
      y.jump(yAt(data[clamped]))
    }
    setIndex(clamped)
  }

  return (
    <div className="w-full max-w-[340px]">
      <div className="mb-3 flex items-end justify-between px-1">
        <div>
          <p className="text-xs text-muted-foreground">Revenue, 24 weeks</p>
          <p className="font-mono text-xl font-medium tracking-tight tabular-nums">{money(total)}</p>
        </div>
        <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-xs text-accent tabular-nums dark:bg-accent/15">
          +{delta.toFixed(1)}% wk
        </span>
      </div>
      <div
        ref={ref}
        className="relative"
        style={{ touchAction: "pan-y" }}
        onPointerDown={point}
        onPointerMove={point}
        onPointerLeave={() => setIndex(null)}
        onPointerCancel={() => setIndex(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full overflow-visible" aria-label="Weekly revenue chart" role="img">
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} className="stroke-border" strokeWidth={1} />
          ))}
          <motion.path
            d={area}
            className="fill-accent"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 0.1, y: 0 } : undefined}
            transition={{ ...springs.lazy, delay: 0.35 }}
          />
          <motion.path
            d={line}
            fill="none"
            className="stroke-accent"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : undefined}
            transition={{ type: "tween", duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
          />
          <AnimatePresence>
            {index !== null && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={springs.snappy}>
                <motion.line x1={x} x2={x} y1={0} y2={H} className="stroke-foreground/25" strokeWidth={1} strokeDasharray="2 3" />
                <motion.circle cx={x} cy={y} r={4.5} className="fill-card stroke-accent" strokeWidth={1.75} />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
        <AnimatePresence>
          {index !== null && (
            <motion.div
              style={{ left, x: tipX }}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={springs.snappy}
              className="pointer-events-none absolute -top-2 rounded-lg border border-border bg-popover px-2 py-1 shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
            >
              <p className="text-[11px] text-muted-foreground tabular-nums">Week {index + 1}</p>
              <p className="font-mono text-sm font-medium tabular-nums">{money(data[index])}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
