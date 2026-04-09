import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Accessibility, X, Type, Contrast, Eye, Link as LinkIcon, BookOpen,
  MousePointer2, Pause, RotateCcw, Focus, Droplet,
} from 'lucide-react'
import { useA11y } from '../contexts/AccessibilityContext'

export default function AccessibilityPanel() {
  const [open, setOpen] = useState(false)
  const { settings, set, toggle, reset } = useA11y()

  const toggles = [
    { key: 'contrast',       icon: Contrast,      label: 'ניגודיות גבוהה' },
    { key: 'reduceMotion',   icon: Pause,         label: 'הפחתת אנימציות' },
    { key: 'underlineLinks', icon: LinkIcon,      label: 'הדגש קישורים' },
    { key: 'readableFont',   icon: BookOpen,      label: 'פונט קריא יותר' },
    { key: 'highlightFocus', icon: Focus,         label: 'הדגש פוקוס' },
    { key: 'grayscale',      icon: Droplet,       label: 'גווני אפור' },
    { key: 'cursor',         icon: MousePointer2, label: 'סמן גדול' },
  ]

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="תפריט נגישות"
        title="נגישות"
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl border-2 border-white/20 flex items-center justify-center transition hover:scale-105"
      >
        <Accessibility size={24} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] bg-ink-900/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-y-0 left-0 w-[92%] max-w-md bg-ink-800 border-r border-gold-400/20 overflow-y-auto"
            >
              <div className="sticky top-0 bg-ink-800 border-b border-white/10 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                    <Accessibility size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">נגישות</h3>
                    <p className="text-xs text-white/50">התאימו את החוויה לצרכים שלכם</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 text-white/60 hover:text-white">
                  <X size={22} />
                </button>
              </div>

              <div className="p-5 space-y-6">
                {/* Font size */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Type size={16} className="text-gold-300" />
                    <h4 className="font-semibold text-white">גודל טקסט</h4>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { v: -1, label: 'קטן' },
                      { v: 0,  label: 'רגיל' },
                      { v: 1,  label: 'גדול' },
                      { v: 2,  label: 'ענק' },
                    ].map((o) => (
                      <button
                        key={o.v}
                        onClick={() => set('fontSize', o.v)}
                        className={`py-2.5 rounded-lg text-sm font-semibold transition ${
                          settings.fontSize === o.v
                            ? 'bg-gold-gradient text-ink-900'
                            : 'bg-ink-700 text-white/70 hover:bg-ink-600'
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Toggles */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Eye size={16} className="text-gold-300" />
                    <h4 className="font-semibold text-white">אפשרויות תצוגה</h4>
                  </div>
                  <div className="space-y-2">
                    {toggles.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => toggle(t.key)}
                        className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-ink-700/50 hover:bg-ink-700 transition text-right"
                      >
                        <div className="flex items-center gap-3">
                          <t.icon size={18} className="text-white/60" />
                          <span className="text-sm text-white">{t.label}</span>
                        </div>
                        <div className={`w-11 h-6 rounded-full relative transition ${
                          settings[t.key] ? 'bg-gold-400' : 'bg-ink-500'
                        }`}>
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                            settings[t.key] ? 'right-0.5' : 'right-5'
                          }`} />
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Reset */}
                <button
                  onClick={reset}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition"
                >
                  <RotateCcw size={16} /> איפוס הגדרות
                </button>

                {/* Statement */}
                <div className="p-4 rounded-xl bg-ink-700/40 border border-white/5 text-xs text-white/50 leading-relaxed">
                  האתר נבנה בהתאם לתקן הישראלי ת״י 5568 (WCAG 2.1 AA). לתלונות נגישות: <a href="mailto:accessibility@premium-electric.co.il" className="text-gold-300 hover:underline">accessibility@premium-electric.co.il</a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
