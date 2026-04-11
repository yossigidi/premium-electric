import { useEffect, useState } from 'react'
import {
  Search, ShoppingBag, User, Menu, X, Heart,
  Tv, Music2, Laptop, Snowflake, Flame, ChefHat, Droplets, Wind, Bot,
  ChevronLeft,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useRouter } from '../router'
import { categories as allCategories } from '../data/products'

const CATEGORY_ICONS = {
  tv: Tv, audio: Music2, computers: Laptop, refrigerators: Snowflake,
  cooktops: Flame, ovens: ChefHat, washers: Droplets, dryers: Wind,
  'robot-vacuums': Bot,
}

const topLinks = [
  { label: 'מותגים',       anchor: '#brands' },
  { label: 'המבצעים שלנו', anchor: '#/search' },
  { label: 'שירות',         anchor: '#contact' },
  { label: 'יצירת קשר',    anchor: '#contact' },
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

  const goCategory = (catId) => { navigate(`/category/${catId}`); setOpen(false) }
  const goAnchor = (anchor) => {
    if (anchor.startsWith('#/')) { navigate(anchor.slice(1)) }
    else if (route.name !== 'home') { navigate('/'); setTimeout(() => document.querySelector(anchor)?.scrollIntoView({ behavior: 'smooth' }), 80) }
    else { document.querySelector(anchor)?.scrollIntoView({ behavior: 'smooth' }) }
    setOpen(false)
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 md:top-8 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-xl shadow-card border-b border-gray-100' : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      <div className="container-luxe flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gold-gradient flex items-center justify-center text-white text-lg font-black">פ</div>
          <div className="leading-none">
            <div className="text-lg font-bold text-gray-900">פרימיום אלקטריק</div>
            <div className="text-[9px] tracking-[0.25em] text-gray-400 uppercase">Luxury Electronics</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {topLinks.map((l, i) => (
            <button key={i} onClick={() => goAnchor(l.anchor)}
              className="text-sm font-medium text-gray-500 hover:text-gold-500 transition-colors">
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => navigate('/search')} className="p-2.5 rounded-full text-gray-500 hover:text-gold-500 hover:bg-gray-50 transition" aria-label="חיפוש"><Search size={20} /></button>
          <button className="hidden md:inline-flex p-2.5 rounded-full text-gray-500 hover:text-gold-500 hover:bg-gray-50 transition" aria-label="מועדפים"><Heart size={20} /></button>
          <button className="hidden md:inline-flex p-2.5 rounded-full text-gray-500 hover:text-gold-500 hover:bg-gray-50 transition" aria-label="חשבון"><User size={20} /></button>
          <button className="relative p-2.5 rounded-full text-gray-500 hover:text-gold-500 hover:bg-gray-50 transition" aria-label="עגלה">
            <ShoppingBag size={20} />
            <span className="absolute -top-0.5 -left-0.5 w-4 h-4 rounded-full bg-gold-gradient text-white text-[10px] font-bold flex items-center justify-center">2</span>
          </button>
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2.5 rounded-full text-gray-700 hover:bg-gray-50" aria-label="תפריט">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Category bar */}
      <div className="hidden lg:block border-t border-gray-100">
        <div className="container-luxe">
          <nav className="flex items-center gap-1 h-11 overflow-x-auto scrollbar-hide">
            {allCategories.map((c) => {
              const Icon = CATEGORY_ICONS[c.id]
              return (
                <button key={c.id} onClick={() => goCategory(c.id)}
                  className="group flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:text-gold-500 hover:bg-gold-50 transition-all whitespace-nowrap shrink-0">
                  {Icon && <Icon size={15} className="text-gray-400 group-hover:text-gold-400" />}
                  <span>{c.name}</span>
                </button>
              )
            })}
            <div className="h-4 w-px bg-gray-200 mx-2 shrink-0" />
            <button onClick={() => navigate('/search')} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold text-gold-500 hover:text-gold-600 whitespace-nowrap shrink-0">
              כל המוצרים <ChevronLeft size={14} />
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="container-luxe py-5">
              <div className="text-[10px] tracking-[0.2em] uppercase text-gold-500 mb-3">קטגוריות</div>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {allCategories.map((c) => {
                  const Icon = CATEGORY_ICONS[c.id]
                  return (
                    <button key={c.id} onClick={() => goCategory(c.id)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gold-50 border border-gray-100 transition text-right">
                      {Icon && <div className="w-8 h-8 rounded-lg bg-white shadow-card text-gray-400 flex items-center justify-center shrink-0"><Icon size={15} /></div>}
                      <span className="text-sm text-gray-700 font-medium">{c.name}</span>
                    </button>
                  )
                })}
              </div>
              <nav className="flex flex-col gap-1">
                {topLinks.map((l, i) => (
                  <button key={i} onClick={() => goAnchor(l.anchor)}
                    className="text-base font-medium text-gray-600 hover:text-gold-500 py-3 border-b border-gray-100 text-right">{l.label}</button>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
