import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, ShieldCheck, Loader2, AlertCircle } from 'lucide-react'
import { signIn } from '../../utils/adminAuth'

/**
 * Passcode gate for the admin panel (phase-2 stand-in for Firebase Auth).
 * Premium dark card on the ink background, matching the builder hero.
 */
export default function AdminLogin({ onSuccess }) {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    // Tiny async beat for feedback; the check itself is synchronous.
    setTimeout(() => {
      if (signIn(passcode)) {
        onSuccess?.()
      } else {
        setError('קוד הגישה שגוי. נסה שוב.')
        setBusy(false)
      }
    }, 350)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-900 px-6">
      <div className="absolute inset-0 bg-radial-glow" />
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-8 shadow-luxe backdrop-blur"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-gradient text-white">
            <ShieldCheck size={26} />
          </span>
          <h1 className="mt-4 text-xl font-bold text-white">פאנל ניהול</h1>
          <p className="mt-1 text-sm text-white/60">כניסת מנהל בלבד — הזן קוד גישה.</p>
        </div>

        <label htmlFor="admin-passcode" className="mb-1.5 block text-sm font-medium text-white/80">
          קוד גישה
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
            <Lock size={16} />
          </span>
          <input
            id="admin-passcode"
            type="password"
            autoComplete="current-password"
            value={passcode}
            onChange={(e) => { setPasscode(e.target.value); setError('') }}
            aria-invalid={!!error}
            aria-describedby={error ? 'admin-passcode-error' : undefined}
            className="w-full rounded-xl border border-white/15 bg-ink-900/60 py-3 pr-10 pl-4 text-white placeholder-white/30 outline-none transition-colors duration-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/40"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p
            id="admin-passcode-error"
            role="alert"
            className="mt-2 flex items-center gap-1.5 text-sm text-red-300"
          >
            <AlertCircle size={14} /> {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !passcode}
          className="btn-gold mt-6 w-full justify-center disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? <><Loader2 size={18} className="animate-spin" /> מאמת…</> : 'כניסה'}
        </button>
      </motion.form>
    </div>
  )
}
