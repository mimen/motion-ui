import { useState, type ReactNode } from "react"
import { motion } from "motion/react"
import { BellOff, Plane } from "lucide-react"
import { cn } from "@/lib/utils"
import { springs } from "@/springs"

const TRACK = 64
const KNOB = 30
const PAD = 4
const ON = TRACK - PAD - KNOB

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-[38px] w-16 shrink-0 rounded-full transition-colors duration-300 outline-offset-2",
        checked ? "bg-accent" : "bg-foreground/12",
      )}
    >
      <motion.span
        aria-hidden
        style={{ top: PAD, height: KNOB }}
        initial={false}
        animate={{ left: checked ? ON : PAD, right: checked ? PAD : ON }}
        // The edge facing the direction of travel leads on the stiffer spring; the other trails.
        transition={checked ? { left: springs.lazy, right: springs.snappy } : { left: springs.snappy, right: springs.lazy }}
        className={cn(
          "absolute rounded-full shadow-[0_1px_2px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.04)] transition-colors duration-300",
          checked ? "bg-accent-foreground" : "bg-white dark:bg-foreground",
        )}
      />
    </button>
  )
}

function Row({ icon, title, detail, children }: { icon: ReactNode; title: string; detail: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-medium tracking-[-0.01em]">{title}</div>
        <div className="truncate text-[13px] text-muted-foreground">{detail}</div>
      </div>
      {children}
    </div>
  )
}

export function StretchySwitch() {
  const [airplane, setAirplane] = useState(true)
  const [quiet, setQuiet] = useState(false)

  return (
    <div className="w-full max-w-[320px] divide-y divide-border rounded-[20px] bg-card px-4 py-1 shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
      <Row icon={<Plane />} title="Airplane mode" detail={airplane ? "Radios off" : "Connected"}>
        <Switch checked={airplane} onChange={setAirplane} label="Airplane mode" />
      </Row>
      <Row icon={<BellOff />} title="Do not disturb" detail={quiet ? "Until 8:00 AM" : "Off"}>
        <Switch checked={quiet} onChange={setQuiet} label="Do not disturb" />
      </Row>
    </div>
  )
}
