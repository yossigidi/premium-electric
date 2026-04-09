import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const A11yContext = createContext(null)
const KEY = 'pe_a11y'

const defaults = {
  fontSize: 0,      // -1, 0, 1, 2
  contrast: false,  // high contrast
  reduceMotion: false,
  underlineLinks: false,
  readableFont: false,
  highlightFocus: false,
  grayscale: false,
  cursor: false,    // big cursor
}

export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
    } catch { return defaults }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings))
    const root = document.documentElement
    const body = document.body
    // Font size
    const scales = { '-1': 0.92, '0': 1, '1': 1.12, '2': 1.25 }
    root.style.fontSize = `${(scales[settings.fontSize] || 1) * 16}px`
    // Toggles
    body.classList.toggle('a11y-contrast',       settings.contrast)
    body.classList.toggle('a11y-reduce-motion',  settings.reduceMotion)
    body.classList.toggle('a11y-underline',      settings.underlineLinks)
    body.classList.toggle('a11y-readable',       settings.readableFont)
    body.classList.toggle('a11y-focus',          settings.highlightFocus)
    body.classList.toggle('a11y-grayscale',      settings.grayscale)
    body.classList.toggle('a11y-cursor',         settings.cursor)
  }, [settings])

  const set   = useCallback((key, value) => setSettings((s) => ({ ...s, [key]: value })), [])
  const toggle= useCallback((key) => setSettings((s) => ({ ...s, [key]: !s[key] })), [])
  const reset = useCallback(() => setSettings(defaults), [])

  return (
    <A11yContext.Provider value={{ settings, set, toggle, reset }}>
      {children}
    </A11yContext.Provider>
  )
}

export function useA11y() {
  const ctx = useContext(A11yContext)
  if (!ctx) throw new Error('useA11y must be used within AccessibilityProvider')
  return ctx
}
