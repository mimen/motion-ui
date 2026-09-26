import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, RotateCcw } from "lucide-react"
import { springs } from "@/springs"

type Phase = "entry" | "verifying" | "verified"

const LENGTH = 6
const blurIn = {
  initial: { opacity: 0, filter: "blur(4px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(4px)" },
}

export function OtpInput() {
  const [code, setCode] = useState("")
  const [phase, setPhase] = useState<Phase>("entry")
  const [focused, setFocused] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (phase !== "verifying") return
    const t = setTimeout(() => setPhase("verified"), 600)
    return () => clearTimeout(t)
  }, [phase])

  const onChange = (raw: string) => {
    const next = raw.replace(/\D/g, "").slice(0, LENGTH)
    setCode(next)
    if (next.length === LENGTH) setPhase("verifying")
  }

  const reset = () => {
    setCode("")
    setPhase("entry")
    requestAnimationFrame(() => input.current?.focus())
  }

  const active = Math.min(code.length, LENGTH - 1)
  const caption =
    phase === "entry" ? "Enter the code sent to ••• 4821" : phase === "verifying" ? "Verifying…" : "You're all set"

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence mode="wait" initial={false}>
        <motion.p key={caption} {...blurIn} transition={springs.snappy} className="text-sm text-muted-foreground">
          {caption}
        </motion.p>
      </AnimatePresence>
      <motion.div
        layout
        transition={springs.smooth}
        style={{ borderRadius: 20 }}
        className={
          phase === "verified"
            ? "flex h-12 items-center gap-2 bg-accent pr-2 pl-4 text-accent-foreground"
            : "relative flex gap-1.5 bg-card p-1.5 shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
        }
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {phase === "verified" ? (
            <motion.div key="done" layout="position" {...blurIn} transition={springs.smooth} className="flex items-center gap-2">
              <Check />
              <span className="text-sm font-medium">Verified</span>
              <button
                onClick={reset}
                aria-label="Reset code"
                className="ml-1 grid size-9 place-items-center rounded-full text-accent-foreground/70 hover:bg-accent-foreground/10 hover:text-accent-foreground"
              >
                <RotateCcw size={14} />
              </button>
            </motion.div>
          ) : (
            <motion.div key="cells" layout="position" exit={blurIn.exit} transition={springs.smooth} className="flex gap-1.5">
              {Array.from({ length: LENGTH }, (_, i) => (
                <div
                  key={i}
                  className="relative grid h-13 w-11 place-items-center rounded-[14px] bg-muted font-mono text-xl tabular-nums"
                >
                  {focused && phase === "entry" && i === active && (
                    <motion.div
                      layoutId="otp-caret"
                      transition={springs.snappy}
                      className="absolute inset-0 rounded-[14px] ring-[1.5px] ring-accent"
                    />
                  )}
                  <AnimatePresence mode="popLayout" initial={false}>
                    {code[i] && (
                      <motion.span
                        key={code[i]}
                        initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                        animate={{ opacity: phase === "verifying" ? 0.45 : 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={springs.snappy}
                      >
                        {code[i]}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              <input
                ref={input}
                value={code}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onSelect={(e) => e.currentTarget.setSelectionRange(code.length, code.length)}
                disabled={phase !== "entry"}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={LENGTH}
                aria-label="One-time code"
                className="absolute inset-0 cursor-text bg-transparent text-transparent caret-transparent opacity-0 outline-none"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
