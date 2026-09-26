import { useLayoutEffect, useState } from "react"
import { motion } from "motion/react"
import { Moon, Sun } from "lucide-react"
import { accents, applyPrefs, loadPrefs } from "@/themes"
import { springs } from "@/springs"

export function Header() {
  const [prefs, setPrefs] = useState(loadPrefs)
  useLayoutEffect(() => applyPrefs(prefs), [prefs])

  return (
    <header className="sticky top-0 z-40 mb-3 bg-background/80 backdrop-blur-xl sm:mb-5">
      <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="text-[15px] font-semibold tracking-[-0.02em]">motion-ui</span>
          <span className="hidden font-mono text-xs text-muted-foreground sm:inline">12 springs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div role="radiogroup" aria-label="Accent" className="flex items-center rounded-full bg-card p-1 ring-1 ring-border">
            {accents.map((a) => {
              const active = prefs.accent === a.id
              return (
                <button
                  key={a.id}
                  role="radio"
                  aria-checked={active}
                  aria-label={a.label}
                  onClick={() => setPrefs((p) => ({ ...p, accent: a.id }))}
                  className="relative grid size-7 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {active && (
                    <motion.span
                      layoutId="swatch-ring"
                      transition={springs.snappy}
                      className="absolute inset-0 rounded-full ring-[1.5px] ring-foreground/70"
                    />
                  )}
                  <span className="size-4 rounded-full" style={{ background: a.accent }} />
                </button>
              )
            })}
          </div>
          <button
            aria-label={prefs.mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setPrefs((p) => ({ ...p, mode: p.mode === "dark" ? "light" : "dark" }))}
            className="grid size-9 place-items-center rounded-full bg-card ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <motion.span key={prefs.mode} initial={{ rotate: -60, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={springs.smooth}>
              {prefs.mode === "dark" ? <Moon /> : <Sun />}
            </motion.span>
          </button>
        </div>
      </div>
    </header>
  )
}
