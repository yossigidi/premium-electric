import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const CompareContext = createContext(null)
const KEY = 'pe_compare'
const MAX = 4

export function CompareProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]')
      return Array.isArray(saved) ? saved.slice(0, MAX) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ids))
  }, [ids])

  const toggle = useCallback((id) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX) return prev
      return [...prev, id]
    })
  }, [])

  const remove = useCallback((id) => {
    setIds((prev) => prev.filter((x) => x !== id))
  }, [])

  const clear = useCallback(() => setIds([]), [])

  const has = useCallback((id) => ids.includes(id), [ids])
  const isFull = ids.length >= MAX

  return (
    <CompareContext.Provider value={{ ids, toggle, remove, clear, has, isFull, max: MAX }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used within CompareProvider')
  return ctx
}
