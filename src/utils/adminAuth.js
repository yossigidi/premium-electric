// ============================================================================
// Admin auth — a lightweight gate for the ingest panel.
//
// Phase-2 stand-in for Firebase Auth: a single shared passcode kept in session
// storage so the manager stays signed in for the tab session but a fresh tab
// re-prompts. This is intentionally minimal — it keeps the admin UI off the
// public surface for a demo; the plan's real auth (Firebase, role-gated) lands
// alongside Firestore in a later phase.
//
// NOTE: client-side checks are not real security. Once a backend exists, the
// ingest/save endpoints must enforce auth server-side; this only guards the UI.
// ============================================================================

const SESSION_KEY = 'pe.admin.auth.v1'

// Overridable at build time via Vite env (VITE_ADMIN_PASSCODE); falls back to a
// dev default so the panel is usable out of the box.
const PASSCODE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_PASSCODE) ||
  'premium2026'

export function isAuthed() {
  if (typeof window === 'undefined') return false
  return window.sessionStorage.getItem(SESSION_KEY) === 'ok'
}

/** Attempt sign-in. Returns true on success. */
export function signIn(passcode) {
  const ok = String(passcode) === String(PASSCODE)
  if (ok && typeof window !== 'undefined') {
    window.sessionStorage.setItem(SESSION_KEY, 'ok')
  }
  return ok
}

export function signOut() {
  if (typeof window !== 'undefined') window.sessionStorage.removeItem(SESSION_KEY)
}
