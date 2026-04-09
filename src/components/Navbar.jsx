import { useEffect, useState } from 'react'
import {
  Search, ShoppingBag, User, Menu, X, Heart,
  Tv, Music2, Laptop, Snowflake, Flame, ChefHat, Droplets, Wind,
  ChevronLeft,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useRouter } from '../router'
import { categories as allCategories } from '../data/products'

const CATEGORY_ICONS = {
  tv:             Tv,
  audio:          Music2,
  computers:      Laptop,
  refrigerators:  Snowflake,
  cooktops:       Flame,
  ovens:          ChefHat,
  washers:        Droplets,
  dryers:         Wind,
}

const topLinks = [
  { label: 'מותגים',     anchor: '#brands' },
  { label: 'המבצעים שלנו', anchor: '#/search' },
  { label: 'שירות',       anchor: '#contact' },
  { label: 'אודות',       anchor: '#contact' },
  { label: 'יצירת קשר',   anchor: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { route, navigate } = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goCategory = (catId) => {
    navigate(`/category/${catId}`)
    setOpen(false)
  }

  const goAnchor = (anchor) => {
    if (anchor.startsWith('#/')) {
      navigate(anchor.slice(1))
    } else if (route.name !== 'home') {
      navigate('/')
      setTimeout(() => {
        const el = document.querySelector(anchor)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 80)
    } else {
      const el = document.querySelector(anchor)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
    setOpen(false)
  }

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={`fixed top-0 md:top-8 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-ink-900/90 backdrop-blur-xl border-b border-gold-400/10'
          : 'bg-ink-900/50 backdrop-blur-md'
      }`}
    >
      {/* ============ Main row ============ */}
      <div className="container-luxe flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center font-display text-ink-900 text-xl font-black shadow-gold-glow">
            פ
          </div>
          <div className="leading-none">
            <div className="font-display text-xl font-bold gold-text">פרימיום אלקטריק</div>
            <div className="text-[10px] tracking-[0.3em] text-white/40 uppercase mt-1">Luxury Electronics</div>
          </div>
        </Link>

        {/* Desktop top nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {topLinks.map((l, i) => (
            <button
              key={i}
              onClick={() => goAnchor(l.anchor)}
              className="relative text-sm font-medium text-white/75 hover:text-gold-300 transition-colors
                         after:absolute after:-bottom-1.5 after:right-0 after:h-px after:w-0 after:bg-gold-400
                         hover:after:w-full after:transition-all after:duration-300"
            >
              {l.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => navigate('/search')}
            className="p-2.5 rounded-full text-white/70 hover:text-gold-300 hover:bg-white/5 transition"
            aria-label="חיפוש"
          >
            <Search size={20} />
          </button>
          <button className="hidden md:inline-flex p-2.5 rounded-full text-white/70 hover:text-gold-300 hover:bg-white/5 transition" aria-label="מועדפים">
            <Heart size={20} />
          </button>
          <button className="hidden md:inline-flex p-2.5 rounded-full text-white/70 hover:text-gold-300 hover:bg-white/5 transition" aria-label="חשבון">
            <User size={20} />
          </button>
          <button className="relative p-2.5 rounded-full text-white/70 hover:text-gold-300 hover:bg-white/5 transition" aria-label="עגלה">
            <ShoppingBag size={20} />
            <span className="absolute -top-0.5 -left-0.5 w-4 h-4 rounded-full bg-gold-400 text-ink-900 text-[10px] font-bold flex items-center justify-center">2</span>
          </button>
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2.5 rounded-full text-white hover:bg-white/5" aria-label="תפריט">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ============ Category bar (desktop) ============ */}
      <div className="hidden lg:block border-t border-white/5 bg-ink-900/50">
        <div className="container-luxe">
          <nav className="flex items-center gap-1 h-12 overflow-x-auto scrollbar-hide">
            {allCategories.map((c) => {
              const Icon = CATEGORY_ICONS[c.id]
              return (
                <button
                  key={c.id}
                  onClick={() => goCategory(c.id)}
                  className="group flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium text-white/70 hover:text-gold-300 hover:bg-gold-400/5 border border-transparent hover:border-gold-400/20 transition-all whitespace-nowrap shrink-0"
                >
                  {Icon && <Icon size={15} className="text-gold-400/80 group-hover:text-gold-300" />}
                  <span>{c.name}</span>
                </button>
              )
            })}
            <div className="h-5 w-px bg-white/10 mx-3 shrink-0" />
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold text-gold-300 hover:text-gold-200 whitespace-nowrap shrink-0"
            >
              כל המוצרים <ChevronLeft size={14} />
            </button>
          </nav>
        </div>
      </div>

      {/* ============ Mobile drawer ============ */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-ink-800/95 backdrop-blur-xl border-t border-gold-400/10"
          >
            <div className="container-luxe py-6">
              {/* Categories grid */}
              <div className="text-xs tracking-[0.2em] uppercase text-gold-300 mb-3">קטגוריות</div>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {allCategories.map((c) => {
                  const Icon = CATEGORY_ICONS[c.id]
                  return (
                    <button
                      key={c.id}
                      onClick={() => goCategory(c.id)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-ink-700/50 hover:bg-ink-700 border border-white/5 transition text-right"
                    >
                      {Icon && (
                        <div className="w-9 h-9 rounded-lg bg-gold-400/10 border border-gold-400/20 text-gold-300 flex items-center justify-center shrink-0">
                          <Icon size={16} />
                        </div>
                      )}
                      <span className="text-sm text-white font-medium">{c.name}</span>
                    </button>
                  )
                })}
              </div>

              {/* Top links */}
              <div className="text-xs tracking-[0.2em] uppercase text-gold-300 mb-3">תפריט</div>
              <nav className="flex flex-col gap-1">
                {topLinks.map((l, i) => (
                  <button
                    key={i}
                    onClick={() => goAnchor(l.anchor)}
                    className="text-lg font-medium text-white/80 hover:text-gold-300 py-3 border-b border-white/5 text-right"
                  >
                    {l.label}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
