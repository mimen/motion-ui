import { useEffect, useRef, useState, type ComponentType } from "react"
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "motion/react"
import { Bell, CreditCard, MessageSquare, Rocket, UserCheck } from "lucide-react"
import { springs } from "@/springs"

type Template = { icon: ComponentType; title: string; body: string }
type Toast = { id: number; template: Template }

const templates: Template[] = [
  { icon: Rocket, title: "Deploy finished", body: "motion-ui is live on Pages" },
  { icon: MessageSquare, title: "New comment", body: "Ana replied to your thread" },
  { icon: CreditCard, title: "Payment received", body: "$240.00 from Northwind" },
  { icon: UserCheck, title: "Invite accepted", body: "Kai joined the workspace" },
  { icon: Bell, title: "Reminder", body: "Design review in 10 minutes" },
]

const HEIGHT = 56
const GAP = 8
// ponytail: the stage fits three expanded toasts, so older ones drop off rather than scroll.
const MAX = 3

function pose(index: number, expanded: boolean) {
  return expanded
    ? { y: -index * (HEIGHT + GAP), scale: 1, opacity: 1 }
    : { y: -index * 10, scale: 1 - index * 0.06, opacity: 1 - index * 0.15 }
}

export function ToastStack() {
  const [toasts, setToasts] = useState<Toast[]>(() =>
    [2, 1, 0].map((i) => ({ id: i, template: templates[i] })),
  )
  const [expanded, setExpanded] = useState(false)
  const nextId = useRef(3)
  const stack = useRef<HTMLDivElement>(null)

  const notify = () => {
    const id = nextId.current++
    setToasts((t) => [{ id, template: templates[id % templates.length] }, ...t].slice(0, MAX))
  }
  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id))

  useEffect(() => {
    if (!expanded) return
    const onDown = (e: PointerEvent) => {
      if (!stack.current?.contains(e.target as Node)) setExpanded(false)
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  }, [expanded])

  return (
    <>
      <button
        onClick={notify}
        className="absolute top-4 flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground active:scale-[0.97]"
      >
        <Bell />
        Notify
      </button>
      <div
        ref={stack}
        className="absolute inset-x-4 bottom-4 mx-auto max-w-80"
        style={{ height: HEIGHT }}
        onPointerEnter={(e) => e.pointerType === "mouse" && setExpanded(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setExpanded(false)}
      >
        <AnimatePresence initial={false}>
          {toasts.map((t, i) => (
            <ToastCard
              key={t.id}
              toast={t}
              index={i}
              count={toasts.length}
              expanded={expanded}
              onTap={() => setExpanded((x) => !x)}
              onDismiss={() => dismiss(t.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}

function ToastCard({
  toast,
  index,
  count,
  expanded,
  onTap,
  onDismiss,
}: {
  toast: Toast
  index: number
  count: number
  expanded: boolean
  onTap: () => void
  onDismiss: () => void
}) {
  const x = useMotionValue(0)
  const fade = useTransform(x, [-160, 0, 160], [0, 1, 0])
  const { icon: Icon, title, body } = toast.template

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const dir = Math.sign(info.offset.x || info.velocity.x)
    if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) {
      animate(x, dir * 320, springs.smooth)
      onDismiss()
    } else animate(x, 0, springs.snappy)
  }

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 origin-top"
      style={{ zIndex: count - index }}
      initial={{ y: 40, scale: 0.9, opacity: 0 }}
      animate={pose(index, expanded)}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={springs.smooth}
    >
      <motion.div
        drag="x"
        dragMomentum={false}
        style={{ x, opacity: fade, height: HEIGHT }}
        onDragEnd={onDragEnd}
        onTap={(e) => (e as PointerEvent).pointerType !== "mouse" && onTap()}
        className="flex cursor-grab items-center gap-3 rounded-2xl bg-primary pr-4 pl-2.5 text-primary-foreground shadow-[0_8px_20px_-10px_rgb(0_0_0/0.4)] active:cursor-grabbing"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-primary-foreground/10">
          <Icon />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-medium">{title}</span>
          <span className="block truncate text-[13px] text-primary-foreground/60">{body}</span>
        </span>
        <span className="text-xs text-primary-foreground/45">now</span>
      </motion.div>
    </motion.div>
  )
}
