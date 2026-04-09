import { useEffect, useState } from 'react'
import { Search, ShoppingBag, User, Menu, X, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useRouter } from '../router'

const links = [
  { label: 'טלוויזיות', href: '#categories' },
  { label: 'שמע',       href: '#featured' },
  { label: 'מחשבים',    href: '#featured' },
  { label: 'מותגים',    href: '#brands' },
  { label: 'יצירת קשר', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { route, navigate } = useRouter()

  const goHome = (anchor) => {
    if (route.name !== 'home') {
      navigate('/')
      setTimeout(() => {
        const el = document.querySelector(anchor)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 80)
    } else {
      const el = document.querySelector(anchor)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={`fixed top-0 md:top-8 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-ink-900/80 backdrop-blur-xl border-b border-gold-400/10'
          : 'bg-transparent'
      }`}
    >
      <div className="container-luxe flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center font-display text-ink-900 text-xl font-black shadow-gold-glow">
            פ
          </div>
          <div className="leading-none">
            <div className="font-display text-xl font-bold gold-text">פרימיום אלקטריק</div>
            <div className="text-[10px] tracking-[0.3em] text-white/40 uppercase mt-1">Luxury Electronics</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          {links.map((l, i) => (
            <button
              key={i}
              onClick={() => goHome(l.href)}
              className="relative text-sm font-medium text-white/75 hover:text-gold-300 transition-colors
                         after:absolute after:-bottom-1.5 after:right-0 after:h-px after:w-0 after:bg-gold-400
                         hover:after:w-full after:transition-all after:duration-300"
            >
              {l.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-full text-white/70 hover:text-gold-300 hover:bg-white/5 transition" aria-label="חיפוש">
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

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-ink-800/95 backdrop-blur-xl border-t border-gold-400/10"
          >
            <nav className="container-luxe py-6 flex flex-col gap-4">
              {links.map((l, i) => (
                <button key={i} onClick={() => { setOpen(false); goHome(l.href) }}
                   className="text-lg font-medium text-white/80 hover:text-gold-300 py-2 border-b border-white/5 text-right">
                  {l.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
