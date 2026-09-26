import type { ComponentType } from "react"
import { MorphButton } from "@/components/gallery/morph-button"
import { StretchySwitch } from "@/components/gallery/stretchy-switch"
import { LiquidTabs } from "@/components/gallery/liquid-tabs"
import { RubberSlider } from "@/components/gallery/rubber-slider"
import { MediaPlayer } from "@/components/gallery/media-player"
import { DrawingChart } from "@/components/gallery/drawing-chart"
import { CommandPalette } from "@/components/gallery/command-palette"
import { ToastStack } from "@/components/gallery/toast-stack"
import { DynamicIsland } from "@/components/gallery/dynamic-island"
import { RollingNumber } from "@/components/gallery/rolling-number"
import { OtpInput } from "@/components/gallery/otp-input"
import { HoldToDelete } from "@/components/gallery/hold-to-delete"

export type GalleryItem = { id: string; title: string; blurb: string; Component: ComponentType }

export const gallery: GalleryItem[] = [
  { id: "morph-button", title: "Morph button", blurb: "Width springs into a spinner, lands on a check, returns to its label.", Component: MorphButton },
  { id: "stretchy-switch", title: "Stretchy switch", blurb: "Each edge of the knob rides its own spring, so it leans into the flip.", Component: StretchySwitch },
  { id: "liquid-tabs", title: "Liquid tabs", blurb: "The leading edge outruns the trailing edge, then the indicator catches up.", Component: LiquidTabs },
  { id: "rubber-slider", title: "Rubber slider", blurb: "Drag past the ends and the track gives with diminishing resistance.", Component: RubberSlider },
  { id: "media-player", title: "Media player", blurb: "Morphing play glyph, scrubbable progress, tabular time.", Component: MediaPlayer },
  { id: "drawing-chart", title: "Self-drawing chart", blurb: "Draws itself into view; a spring-following guide tracks your finger.", Component: DrawingChart },
  { id: "command-palette", title: "Command palette", blurb: "Press ⌘K or tap. The highlight glides between results.", Component: CommandPalette },
  { id: "toast-stack", title: "Toast stack", blurb: "Stacked toasts fan out on tap or hover and swipe away.", Component: ToastStack },
  { id: "dynamic-island", title: "Dynamic island", blurb: "One pill, four states, content blur-swapped inside.", Component: DynamicIsland },
  { id: "rolling-number", title: "Rolling number", blurb: "Each digit rolls on its own wheel, odometer style.", Component: RollingNumber },
  { id: "otp-input", title: "One-time code", blurb: "A caret glides between cells; a full code becomes a chip.", Component: OtpInput },
  { id: "hold-to-delete", title: "Hold to delete", blurb: "Press and hold to fill. Let go early and it springs back.", Component: HoldToDelete },
]
