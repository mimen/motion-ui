export type Mode = "light" | "dark"

export const accents = [
  { id: "mono", label: "Mono", accent: "light-dark(#0b0b0a, #f2f1ef)", accentForeground: "light-dark(#ffffff, #0b0b0a)" },
  { id: "blue", label: "Blue", accent: "#2f6bf6", accentForeground: "#ffffff" },
  { id: "orange", label: "Orange", accent: "#f0620f", accentForeground: "#ffffff" },
  { id: "green", label: "Green", accent: "#1f9a52", accentForeground: "#ffffff" },
  { id: "violet", label: "Violet", accent: "#7a4df5", accentForeground: "#ffffff" },
  { id: "rose", label: "Rose", accent: "#e23a5e", accentForeground: "#ffffff" },
] as const

export type AccentId = (typeof accents)[number]["id"]
export type ThemePrefs = { accent: AccentId; mode: Mode }

const KEY = "motion-ui:theme"

export function loadPrefs(): ThemePrefs {
  const fallback: ThemePrefs = {
    accent: "mono",
    mode: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  }
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null")
    const accent = accents.find((a) => a.id === saved?.accent)?.id ?? fallback.accent
    const mode = saved?.mode === "dark" || saved?.mode === "light" ? saved.mode : fallback.mode
    return { accent, mode }
  } catch {
    return fallback
  }
}

export function applyPrefs(prefs: ThemePrefs) {
  const accent = accents.find((a) => a.id === prefs.accent) ?? accents[0]
  const root = document.documentElement
  root.style.setProperty("--accent", accent.accent)
  root.style.setProperty("--accent-foreground", accent.accentForeground)
  root.classList.toggle("dark", prefs.mode === "dark")
  root.style.colorScheme = prefs.mode
  localStorage.setItem(KEY, JSON.stringify(prefs))
}
