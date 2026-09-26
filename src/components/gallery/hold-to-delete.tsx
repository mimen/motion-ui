import { useRef, useState, type ReactNode } from "react"
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
} from "motion/react"
import { Check, Trash2 } from "lucide-react"
import { springs } from "@/springs"

type State = "idle" | "holding" | "deleted"

const HOLD_MS = 1400

const Label = ({ children }: { children: ReactNode }) => (
  <span className="flex h-11 items-center justify-center gap-2 px-5 text-sm font-medium whitespace-nowrap">
    <Trash2 />
    {children}
  </span>
)

export function HoldToDelete() {
  const [state, setStateValue] = useState<State>("idle")
  // Mirrored in a ref: the exiting button keeps a stale closure and still receives the captured pointerup.
  const current = useRef<State>("idle")
  const setState = (next: State) => {
    current.current = next
    setStateValue(next)
  }
  const progress = useMotionValue(0)
  const clipPath = useTransform(progress, (p) => `inset(0 ${100 - p * 100}% 0 0)`)
  const fill = useRef<AnimationPlaybackControls>(null)
  // The timer, not the fill animation, gates deletion so reduced motion still requires a full hold.
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const start = () => {
    if (current.current !== "idle") return
    setState("holding")
    const remaining = 1 - progress.get()
    fill.current = animate(progress, 1, { duration: (HOLD_MS / 1000) * remaining, ease: "linear" })
    timer.current = setTimeout(() => setState("deleted"), HOLD_MS * remaining)
  }

  const release = () => {
    if (current.current !== "holding") return
    clearTimeout(timer.current)
    fill.current?.stop()
    animate(progress, 0, springs.smooth)
    setState("idle")
  }

  const undo = () => {
    progress.set(0)
    setState("idle")
  }

  const isKey = (key: string) => key === " " || key === "Enter"

  return (
    <motion.div
      layout
      animate={{ scale: state === "holding" ? 0.97 : 1 }}
      transition={springs.smooth}
      style={{ borderRadius: 16 }}
      className="relative overflow-hidden border border-border bg-card shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {state === "deleted" ? (
          <motion.div
            key="deleted"
            layout="position"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={springs.smooth}
            className="flex h-11 items-center gap-1 pr-1 pl-4 text-sm"
          >
            <Check />
            <span className="mr-2 font-medium">Deleted</span>
            <button
              onClick={undo}
              className="h-9 rounded-[11px] bg-muted px-3.5 text-sm font-medium hover:bg-foreground/8"
            >
              Undo
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="button"
            layout="position"
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={springs.smooth}
            aria-label="Hold to delete"
            className="relative block touch-none select-none"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              start()
            }}
            onPointerUp={release}
            onPointerCancel={release}
            onKeyDown={(e) => {
              if (!isKey(e.key)) return
              e.preventDefault()
              if (!e.repeat) start()
            }}
            onKeyUp={(e) => isKey(e.key) && release()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <Label>Hold to delete</Label>
            <motion.span
              aria-hidden
              style={{ clipPath }}
              className="absolute inset-0 bg-destructive text-white"
            >
              <Label>Hold to delete</Label>
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
