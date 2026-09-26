import { Toaster as Sonner, type ToasterProps } from "sonner"

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-center"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-center gap-3 rounded-2xl bg-primary px-4 py-3 text-sm text-primary-foreground shadow-[0_8px_24px_-8px_rgb(0_0_0/0.35)]",
          title: "font-medium",
          description: "text-primary-foreground/60",
        },
      }}
      {...props}
    />
  )
}
