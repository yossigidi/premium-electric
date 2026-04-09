import { createContext, useContext, useEffect, useState, useCallback } from 'react'

/** Simple hash-based router: #/ , #/product/:id */
const RouterContext = createContext(null)

function parseHash() {
  const hash = window.location.hash.replace(/^#/, '') || '/'
  if (hash === '/' || hash === '') return { name: 'home' }
  const m = hash.match(/^\/product\/(\d+)/)
  if (m) return { name: 'product', id: Number(m[1]) }
  return { name: 'home' }
}

export function RouterProvider({ children }) {
  const [route, setRoute] = useState(parseHash)

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash())
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((to) => {
    window.location.hash = to
  }, [])

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter must be used within RouterProvider')
  return ctx
}

/** Anchor that navigates via hash */
export function Link({ to, children, className, onClick, ...props }) {
  const { navigate } = useRouter()
  return (
    <a
      href={`#${to}`}
      onClick={(e) => {
        e.preventDefault()
        onClick?.(e)
        navigate(to)
      }}
      className={className}
      {...props}
    >
      {children}
    </a>
  )
}
