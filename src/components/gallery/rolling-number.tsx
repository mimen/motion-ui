import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Minus, Plus } from "lucide-react"
import { springs } from "@/springs"

const PRICE = 249
const MIN = 1
const MAX = 40
const H = 56

// Keyed by place value from the right, so the ones wheel stays the ones wheel when a digit is added.
function glyphs(n: number) {
  const s = n.toLocaleString("en-US")
  let place = 0
  return [...s]
    .reverse()
    .map((char) => (/\d/.test(char) ? { key: `d${place++}`, char } : { key: `s${place}`, char }))
    .reverse()
}

function Wheel({ digit }: { digit: number }) {
  return (
    <span className="relative inline-block h-full w-[0.62em] overflow-hidden">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={false}
        animate={{ y: -digit * H }}
        transition={springs.smooth}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="flex items-center justify-center" style={{ height: H }}>
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

function StepButton({ label, onStep, disabled, children }: { label: string; onStep: () => void; disabled: boolean; children: React.ReactNode }) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const stop = () => clearTimeout(timer.current)
  useEffect(() => stop, [])
  useEffect(() => {
    if (disabled) stop()
  }, [disabled])

  const repeat = (delay: number) => {
    timer.current = setTimeout(() => {
      onStep()
      repeat(80)
    }, delay)
  }

  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled}
      whileTap={{ scale: 0.92 }}
      transition={springs.snappy}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        onStep()
        repeat(420)
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onClick={(e) => e.detail === 0 && onStep()}
      className="grid size-12 shrink-0 touch-none place-items-center rounded-full bg-card text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.06)] transition-opacity select-none disabled:opacity-40"
    >
      {children}
    </motion.button>
  )
}

export function RollingNumber() {
  const [seats, setSeats] = useState(4)
  const step = (d: number) => setSeats((s) => Math.min(MAX, Math.max(MIN, s + d)))
  const total = seats * PRICE

  return (
    <div className="flex w-full max-w-[340px] flex-col items-center gap-5">
      <div className="flex flex-col items-center">
        <div className="text-[13px] text-muted-foreground">Total per month</div>
        <div
          role="status"
          aria-label={`$${total.toLocaleString("en-US")}`}
          className="flex overflow-hidden text-[52px] leading-none font-semibold tracking-[-0.05em] tabular-nums"
          style={{ height: H, maskImage: "linear-gradient(transparent, #000 20%, #000 80%, transparent)" }}
        >
          <span className="flex h-full items-center pr-[0.04em] text-muted-foreground">$</span>
          <AnimatePresence initial={false}>
            {glyphs(total).map(({ key, char }) => (
              <motion.span
                key={key}
                className="flex h-full items-center justify-end overflow-hidden"
                initial={{ opacity: 0, filter: "blur(4px)", width: 0 }}
                animate={{ opacity: 1, filter: "blur(0px)", width: "auto" }}
                exit={{ opacity: 0, filter: "blur(4px)", width: 0 }}
                transition={springs.smooth}
              >
                {/\d/.test(char) ? <Wheel digit={Number(char)} /> : char}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <StepButton label="Remove seat" onStep={() => step(-1)} disabled={seats <= MIN}>
          <Minus size={18} />
        </StepButton>
        <div className="w-[104px] text-center">
          <div className="text-[15px] font-medium tracking-[-0.01em] tabular-nums">
            {seats} {seats === 1 ? "seat" : "seats"}
          </div>
          <div className="text-[13px] text-muted-foreground tabular-nums">${PRICE} each</div>
        </div>
        <StepButton label="Add seat" onStep={() => step(1)} disabled={seats >= MAX}>
          <Plus size={18} />
        </StepButton>
      </div>
    </div>
  )
}
