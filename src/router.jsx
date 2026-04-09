import { createContext, useContext, useEffect, useState, useCallback } from 'react'

/** Hash-based router: #/ , #/product/:id , #/search , #/compare */
const RouterContext = createContext(null)

function parseHash() {
  const hash = window.location.hash.replace(/^#/, '') || '/'
  if (hash === '/' || hash === '') return { name: 'home' }
  const mProd = hash.match(/^\/product\/(\d+)/)
  if (mProd) return { name: 'product', id: Number(mProd[1]) }
  const mCat = hash.match(/^\/category\/([^?/]+)/)
  if (mCat) return { name: 'category', catId: decodeURIComponent(mCat[1]) }
  if (hash.startsWith('/search')) return { name: 'search' }
  if (hash.startsWith('/compare')) return { name: 'compare' }
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
