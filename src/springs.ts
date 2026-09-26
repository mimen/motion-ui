import { MotionGlobalConfig, type Transition } from "motion/react"

export const reducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

// useSpring/useFollowValue ignore instantAnimations, so the presets carry the instant case too.
MotionGlobalConfig.instantAnimations = reducedMotion

const spring = (visualDuration: number, bounce: number): Transition =>
  reducedMotion
    ? { type: "tween", duration: 0 }
    : { type: "spring", visualDuration, bounce }

export const springs = {
  snappy: spring(0.22, 0.1),
  smooth: spring(0.38, 0.08),
  lazy: spring(0.55, 0.04),
}
