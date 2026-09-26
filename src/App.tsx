import { LucideProvider } from "lucide-react"
import { gallery } from "@/gallery"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

export function App() {
  return (
    <LucideProvider size={16} strokeWidth={1.75}>
      <TooltipProvider>
        <Header />
        <main className="mx-auto grid max-w-[1320px] gap-3 px-3 pb-16 sm:gap-4 sm:px-6 md:grid-cols-2 xl:grid-cols-3">
          {gallery.map(({ id, title, blurb, Component }) => (
            <article
              key={id}
              id={id}
              className="flex flex-col rounded-[22px] border border-border bg-card p-1.5 shadow-[0_1px_2px_rgb(0_0_0/0.04)]"
            >
              <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-2xl bg-muted/60 px-4">
                <Component />
              </div>
              <div className="px-3.5 pt-3 pb-3">
                <h2 className="text-[15px] font-medium tracking-[-0.01em]">{title}</h2>
                <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{blurb}</p>
              </div>
            </article>
          ))}
        </main>
        <Toaster />
      </TooltipProvider>
    </LucideProvider>
  )
}
