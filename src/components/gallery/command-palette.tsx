import { useEffect, useRef, useState, type ComponentType } from "react"
import { createPortal } from "react-dom"
import { Command } from "cmdk"
import { AnimatePresence, motion } from "motion/react"
import {
  BookOpen,
  Inbox,
  LayoutGrid,
  Link2,
  LogOut,
  Moon,
  Plus,
  Search,
  Settings,
  UserPlus,
} from "lucide-react"
import { toast } from "sonner"
import { springs } from "@/springs"

type Item = { label: string; icon: ComponentType; keys: string[] }

const groups: { heading: string; items: Item[] }[] = [
  {
    heading: "Navigation",
    items: [
      { label: "Go to Dashboard", icon: LayoutGrid, keys: ["G", "D"] },
      { label: "Go to Inbox", icon: Inbox, keys: ["G", "I"] },
      { label: "Go to Settings", icon: Settings, keys: ["G", "S"] },
      { label: "Search docs", icon: BookOpen, keys: ["?"] },
    ],
  },
  {
    heading: "Actions",
    items: [
      { label: "New issue", icon: Plus, keys: ["C"] },
      { label: "Invite teammate", icon: UserPlus, keys: ["⌘", "I"] },
      { label: "Copy link", icon: Link2, keys: ["⌘", "L"] },
      { label: "Toggle theme", icon: Moon, keys: ["⌘", "J"] },
      { label: "Log out", icon: LogOut, keys: ["⇧", "Q"] },
    ],
  },
]

const Kbd = ({ children }: { children: string }) => (
  <kbd className="grid h-5 min-w-5 place-items-center rounded-md border border-border bg-card px-1 font-mono text-[11px] text-muted-foreground">
    {children}
  </kbd>
)

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const trigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const run = (label: string) => {
    setOpen(false)
    toast(label, { description: "Ran from the command palette" })
  }

  return (
    <>
      <div className="h-11 w-full max-w-72">
        {!open && (
          <motion.button
            ref={trigger}
            layoutId="palette-surface"
            transition={springs.smooth}
            style={{ borderRadius: 14 }}
            onClick={() => setOpen(true)}
            className="flex h-11 w-full items-center gap-2.5 border border-border bg-card pr-2 pl-3.5 text-left text-sm text-muted-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04)]"
          >
            <Search />
            <span className="flex-1">Search commands…</span>
            <span className="flex gap-1">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          </motion.button>
        )}
      </div>
      {createPortal(
        <AnimatePresence onExitComplete={() => trigger.current?.focus()}>
          {open && (
            <div className="fixed inset-0 z-50 px-3 pt-3 sm:pt-[14vh]">
              <motion.div
                key="scrim"
                className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={springs.smooth}
                onClick={() => setOpen(false)}
              />
              <motion.div
                layoutId="palette-surface"
                transition={springs.smooth}
                style={{ borderRadius: 20 }}
                className="relative mx-auto max-w-[560px] overflow-hidden border border-border bg-card shadow-[0_24px_48px_-16px_rgb(0_0_0/0.3)]"
              >
                <motion.div
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, transition: { duration: 0.08 } }}
                  transition={springs.smooth}
                >
                  <Command value={value} onValueChange={setValue} loop label="Command palette">
                    <div className="flex h-13 items-center gap-2.5 border-b border-border px-4 text-muted-foreground">
                      <Search />
                      <Command.Input
                        autoFocus
                        placeholder="Type a command or search…"
                        className="h-full flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
                      />
                      <Kbd>esc</Kbd>
                    </div>
                    <Command.List className="max-h-[min(360px,50vh)] scroll-py-2 overflow-y-auto p-2">
                      <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                        No results.
                      </Command.Empty>
                      {groups.map((g) => (
                        <Command.Group
                          key={g.heading}
                          heading={g.heading}
                          className="**:[[cmdk-group-heading]]:px-2.5 **:[[cmdk-group-heading]]:pt-2 **:[[cmdk-group-heading]]:pb-1 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:text-muted-foreground"
                        >
                          {g.items.map(({ label, icon: Icon, keys }) => (
                            <Command.Item
                              key={label}
                              value={label}
                              onSelect={() => run(label)}
                              className="relative flex h-11 cursor-default items-center gap-3 rounded-xl px-2.5 text-sm text-muted-foreground select-none data-[selected=true]:text-foreground"
                            >
                              {value === label && (
                                <motion.div
                                  layoutId="palette-highlight"
                                  transition={springs.snappy}
                                  className="absolute inset-0 rounded-xl bg-muted"
                                />
                              )}
                              <span className="relative flex flex-1 items-center gap-3">
                                <Icon />
                                <span className="flex-1 text-foreground">{label}</span>
                                <span className="flex gap-1">
                                  {keys.map((k) => (
                                    <Kbd key={k}>{k}</Kbd>
                                  ))}
                                </span>
                              </span>
                            </Command.Item>
                          ))}
                        </Command.Group>
                      ))}
                    </Command.List>
                  </Command>
                </motion.div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
