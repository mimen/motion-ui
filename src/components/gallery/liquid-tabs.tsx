import { useLayoutEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Tabs as TabsPrimitive } from "radix-ui"
import { Activity, LayoutGrid, Settings2 } from "lucide-react"
import { springs } from "@/springs"

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutGrid, stat: "12", unit: "projects", note: "3 deployed today" },
  { id: "activity", label: "Activity", icon: Activity, stat: "248", unit: "events", note: "Last one 4 min ago" },
  { id: "settings", label: "Settings", icon: Settings2, stat: "5", unit: "members", note: "2 pending invites" },
] as const

type TabId = (typeof tabs)[number]["id"]

export function LiquidTabs() {
  const [value, setValue] = useState<TabId>("overview")
  const [goingRight, setGoingRight] = useState(true)
  const [edges, setEdges] = useState<{ left: number; right: number } | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const list = listRef.current
    const el = list?.querySelector<HTMLElement>(`[data-tab="${value}"]`)
    if (!list || !el) return
    const measure = () =>
      setEdges({ left: el.offsetLeft, right: list.clientWidth - el.offsetLeft - el.offsetWidth })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    return () => ro.disconnect()
  }, [value])

  const select = (v: string) => {
    setGoingRight(tabs.findIndex((t) => t.id === v) > tabs.findIndex((t) => t.id === value))
    setValue(v as TabId)
  }

  const tab = tabs.find((t) => t.id === value)!

  return (
    <TabsPrimitive.Root
      value={value}
      onValueChange={select}
      className="flex w-full max-w-[340px] flex-col gap-2"
    >
      <TabsPrimitive.List
        ref={listRef}
        className="relative flex rounded-full bg-card p-1 shadow-[0_1px_2px_rgb(0_0_0/0.04)]"
      >
        {edges && (
          <motion.span
            aria-hidden
            className="absolute inset-y-1 rounded-full bg-primary"
            initial={false}
            animate={edges}
            // The edge facing the direction of travel leads on the stiffer spring.
            transition={goingRight ? { left: springs.lazy, right: springs.snappy } : { left: springs.snappy, right: springs.lazy }}
          />
        )}
        {tabs.map(({ id, label, icon: Icon }) => (
          <TabsPrimitive.Trigger
            key={id}
            value={id}
            data-tab={id}
            className="relative z-10 flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-[14px] font-medium tracking-[-0.01em] text-muted-foreground transition-colors duration-200 outline-offset-2 data-[state=active]:text-primary-foreground"
          >
            <Icon />
            {label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      <div className="relative h-[108px] overflow-hidden rounded-[20px] bg-card p-4 shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, filter: "blur(4px)", y: 6 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(4px)", y: -6 }}
            transition={springs.smooth}
          >
            <TabsPrimitive.Content value={tab.id} forceMount className="outline-none">
              <div className="text-[13px] text-muted-foreground">{tab.label}</div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[34px] leading-none font-semibold tracking-[-0.04em] tabular-nums">{tab.stat}</span>
                <span className="text-[14px] text-muted-foreground">{tab.unit}</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[13px]">
                <span className="size-1.5 rounded-full bg-accent" />
                {tab.note}
              </div>
            </TabsPrimitive.Content>
          </motion.div>
        </AnimatePresence>
      </div>
    </TabsPrimitive.Root>
  )
}
