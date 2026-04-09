import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send, Bot, User as UserIcon, HelpCircle } from 'lucide-react'
import { products, categories } from '../data/products'
import { Link } from '../router'

const fmt = (n) => new Intl.NumberFormat('he-IL').format(n)

/** Simple Hebrew-aware rules bot that understands the product catalog */
function generateReply(text) {
  const q = text.toLowerCase().trim()

  // Greetings
  if (/(שלום|היי|הי|hello|hi|בוקר|ערב)/i.test(q)) {
    return {
      text: 'שלום! 👋 אני שרית, העוזרת הדיגיטלית של פרימיום אלקטריק. אשמח לעזור לכם למצוא את המוצר המתאים, להסביר על אחריות, משלוחים, או להמליץ לפי תקציב. במה אוכל לעזור?',
      quickReplies: ['אני מחפש טלוויזיה', 'המלצה למערכת שמע', 'מה המחשב הכי חזק?', 'מידע על משלוחים'],
    }
  }

  // Budget query: "עד X", "תקציב של X"
  const budgetMatch = q.match(/(?:עד|תקציב|בסביבות|ב-?)\s*(\d{3,7})/)
  if (budgetMatch) {
    const budget = Number(budgetMatch[1])
    const matches = products.filter((p) => p.price <= budget).sort((a, b) => b.rating - a.rating).slice(0, 3)
    if (matches.length === 0) {
      return { text: `לצערי לא מצאתי מוצרים עד ₪${fmt(budget)}. המוצר הכי זול בקטלוג הוא ${products.reduce((a, b) => a.price < b.price ? a : b).name} ב-₪${fmt(Math.min(...products.map((p) => p.price)))}. רוצים שאראה לכם?` }
    }
    return {
      text: `מצאתי ${matches.length} מוצרים נהדרים בתקציב של עד ₪${fmt(budget)}:`,
      products: matches,
    }
  }

  // Category queries
  if (/(טלוויזי|טלביזי|tv|oled|qled|מסך)/i.test(q)) {
    const tvs = products.filter((p) => p.category === 'tv').sort((a, b) => b.rating - a.rating).slice(0, 3)
    return {
      text: 'בחרתי עבורכם את 3 הטלוויזיות הכי מומלצות שלנו — כולן OLED או QLED בגודל 75-77 אינץ׳:',
      products: tvs,
    }
  }
  if (/(שמע|רמקול|סאונד|סאונדבר|audio|speaker)/i.test(q)) {
    const audio = products.filter((p) => p.category === 'audio').sort((a, b) => b.rating - a.rating).slice(0, 3)
    return {
      text: 'הנה המערכות שמע המובילות שלנו, לפי דירוג לקוחות:',
      products: audio,
    }
  }
  if (/(מחשב|לפטופ|laptop|pc|macbook|gaming|גיימינג)/i.test(q)) {
    const comps = products.filter((p) => p.category === 'computers').sort((a, b) => b.rating - a.rating).slice(0, 3)
    return {
      text: 'הנה המחשבים הכי חזקים בקטלוג שלנו — מקצועי עד גיימינג ברמה הגבוהה ביותר:',
      products: comps,
    }
  }
  if (/(מקרר|קירור|fridge|refriger)/i.test(q)) {
    const items = products.filter((p) => p.category === 'refrigerators').sort((a, b) => b.rating - a.rating).slice(0, 3)
    return {
      text: 'המקררים האינטגרליים הטובים ביותר שלנו — ממותגים אירופאיים כמו Miele, Liebherr ו-Gaggenau:',
      products: items,
    }
  }
  if (/(כיריים|כירה|אינדוקצי|cooktop|induction)/i.test(q)) {
    const items = products.filter((p) => p.category === 'cooktops').sort((a, b) => b.rating - a.rating).slice(0, 3)
    return {
      text: 'כיריים אינדוקציה פרימיום — מבישול מדויק עד משטח מלא:',
      products: items,
    }
  }
  if (/(תנור|אפייה|oven|bake)/i.test(q)) {
    const items = products.filter((p) => p.category === 'ovens').sort((a, b) => b.rating - a.rating).slice(0, 3)
    return {
      text: 'התנורים המתקדמים בקטלוג שלנו — פירוליטיים, קומבי-קיטור ו-Sous Vide:',
      products: items,
    }
  }
  if (/(מכונת כביסה|כביסה|washer|laundry)/i.test(q)) {
    const items = products.filter((p) => p.category === 'washers').sort((a, b) => b.rating - a.rating).slice(0, 3)
    return {
      text: 'מכונות כביסה יוקרתיות — Miele שנבנתה ל-20 שנות שימוש, V-Zug שוויצרי, ועוד:',
      products: items,
    }
  }
  if (/(מייבש|ייבוש|dryer|tumble)/i.test(q)) {
    const items = products.filter((p) => p.category === 'dryers').sort((a, b) => b.rating - a.rating).slice(0, 3)
    return {
      text: 'מייבשים עם משאבת חום — חיסכון אדיר בחשמל ועדינות מקסימלית לבגדים:',
      products: items,
    }
  }
  if (/(מטבח|kitchen)/i.test(q)) {
    const kitchen = products.filter((p) => ['refrigerators', 'cooktops', 'ovens'].includes(p.category)).sort((a, b) => b.rating - a.rating).slice(0, 3)
    return {
      text: 'הנה שלושת מוצרי המטבח המובילים שלנו — הבסיס למטבח בסטנדרט של שפים:',
      products: kitchen,
    }
  }

  // Shipping
  if (/(משלוח|שילוח|להביא|הבאה|עד הבית|delivery)/i.test(q)) {
    return {
      text: 'המשלוח וההתקנה שלנו חינם בכל הארץ! 🚚\n\n• משלוח תוך 48 שעות ממועד ההזמנה\n• צוות טכנאים מוסמך מגיע עם המוצר\n• התקנה, חיבור לרשת וכיול — הכל כלול\n• אפשרות לתיאום מועד נוח לכם',
      quickReplies: ['מה עם אחריות?', 'איך מחזירים?', 'תשלומים'],
    }
  }

  // Warranty
  if (/(אחריות|תקלה|תיקון|warranty)/i.test(q)) {
    return {
      text: 'האחריות שלנו היא מהמקיפות בישראל:\n\n🛡 **אחריות יבואן רשמי** — 3 עד 5 שנים לפי מוצר\n🏠 **שירות בבית הלקוח** — טכנאי מגיע אליכם\n🔄 **החלפת מכשיר** בשנים הראשונות במקרה תקלה חריגה\n📞 **קו VIP 24/7** בעברית',
      quickReplies: ['מה לגבי משלוחים?', 'החזרת מוצר'],
    }
  }

  // Returns
  if (/(החזר|ביטול|לא רוצה|להחזיר|return)/i.test(q)) {
    return {
      text: 'יש לכם 14 ימי ניסיון מרגע קבלת המוצר! אם לא שבעי רצון מכל סיבה — נאסוף את המוצר חזרה ונחזיר לכם את מלוא התשלום, ללא שאלות. ✨',
    }
  }

  // Payments / installments
  if (/(תשלום|תשלומים|ריבית|אשראי|מימון|payment)/i.test(q)) {
    return {
      text: 'יש מספר אפשרויות תשלום נוחות:\n\n💳 עד **36 תשלומים ללא ריבית** בכרטיס אשראי\n🏦 מימון מורחב עד **60 תשלומים** דרך חברת האשראי\n💎 תשלום מלא עם **הנחת מזומן** של 3%\n📱 תשלום ב-Bit או העברה בנקאית',
    }
  }

  // Brand query
  const brandHit = products.find((p) => q.includes(p.brand.toLowerCase()))
  if (brandHit) {
    const brandProducts = products.filter((p) => p.brand === brandHit.brand)
    return {
      text: `${brandHit.brand} הוא אחד המותגים היוקרתיים בקטלוג שלנו. הנה המוצרים הזמינים:`,
      products: brandProducts.slice(0, 3),
    }
  }

  // Recommendation
  if (/(המלצה|המלץ|מה.*הכי|מומלץ|recommend)/i.test(q)) {
    const top = [...products].sort((a, b) => b.rating - a.rating).slice(0, 3)
    return {
      text: '3 המוצרים המומלצים ביותר שלנו לפי דירוג לקוחות:',
      products: top,
    }
  }

  // Compare
  if (/(השווה|השוואה|הבדל|compare)/i.test(q)) {
    return {
      text: 'מעולה! 📊 לחיצה על הכפתור ⚖️ בכל מוצר תוסיף אותו להשוואה. אפשר להשוות עד 4 מוצרים במקביל ולראות את כל המפרטים זה מול זה.',
    }
  }

  // Default
  return {
    text: 'מעניין! אני עדיין לומדת את השאלות האלה 😊 אבל אשמח לעזור עם: המלצות לפי תקציב, מידע על מוצר ספציפי, משלוחים ואחריות, או לחבר אתכם לנציג אמיתי. מה מעניין אתכם?',
    quickReplies: ['המלצה לטלוויזיה', 'משלוחים', 'אחריות', 'דבר עם נציג'],
  }
}

export default function AIChatBot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'שלום! 👋 אני **שרית**, העוזרת הדיגיטלית של פרימיום אלקטריק. אשמח לעזור לכם למצוא את המוצר המושלם או לענות על שאלות.',
      quickReplies: ['המלצה לטלוויזיה', 'מקרר Miele', 'תנור אפייה', 'מכונת כביסה', 'מידע על משלוחים'],
    },
  ])
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  const send = (text) => {
    const t = (text ?? input).trim()
    if (!t) return
    setMessages((m) => [...m, { role: 'user', text: t }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const reply = generateReply(t)
      setMessages((m) => [...m, { role: 'bot', ...reply }])
      setTyping(false)
    }, 700 + Math.random() * 500)
  }

  return (
    <>
      {/* Button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="עזרה ובוט שיחה"
        title="עזרה ושיחה חכמה"
        className="fixed bottom-6 left-6 z-[60] group flex items-center gap-3 pr-5 pl-4 h-14 rounded-full bg-gold-gradient text-ink-900 shadow-gold-glow hover:scale-105 transition"
      >
        <div className="relative">
          <Sparkles size={22} />
          <span className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-ink-900 animate-pulse" />
        </div>
        <span className="font-bold text-sm hidden sm:inline">עזרה ושיחה</span>
      </button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 24 }}
            className="fixed bottom-24 left-6 right-6 sm:right-auto sm:w-[400px] z-[70] bg-ink-800 rounded-3xl border border-gold-400/30 shadow-luxe overflow-hidden flex flex-col max-h-[72vh]"
          >
            {/* Header */}
            <div className="relative p-5 bg-gradient-to-l from-gold-400/15 to-transparent border-b border-white/10">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gold-gradient flex items-center justify-center text-ink-900">
                    <Bot size={22} />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-ink-800" />
                </div>
                <div>
                  <div className="font-display text-lg font-bold text-white flex items-center gap-2">
                    שרית
                    <Sparkles size={13} className="text-gold-300" />
                  </div>
                  <div className="text-xs text-emerald-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    פעילה · מגיבה מיד
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => <Message key={i} m={m} onQuick={send} />)}
              {typing && (
                <div className="flex items-end gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-ink-900 shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="bg-ink-700 rounded-2xl rounded-br-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                      <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send() }}
              className="p-4 border-t border-white/10 bg-ink-900/50"
            >
              <div className="flex items-center gap-2 bg-ink-700 rounded-full border border-white/10 focus-within:border-gold-400/50 transition p-1">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="שאלו אותי כל דבר..."
                  className="flex-1 bg-transparent outline-none text-white placeholder-white/30 text-sm px-4 py-2"
                />
                <button
                  type="submit"
                  className="w-10 h-10 rounded-full bg-gold-gradient text-ink-900 hover:shadow-gold-glow transition flex items-center justify-center shrink-0"
                  aria-label="שלח"
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="text-[10px] text-white/30 text-center mt-2">
                מופעל ע״י AI · לייעוץ אישי מלא — <button type="button" className="text-gold-300 hover:underline">דברו עם נציג</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Message({ m, onQuick }) {
  const isBot = m.role === 'bot'
  return (
    <div className={`flex gap-2 ${isBot ? 'items-end' : 'flex-row-reverse items-end'}`}>
      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
        isBot ? 'bg-gold-gradient text-ink-900' : 'bg-ink-600 text-white'
      }`}>
        {isBot ? <Bot size={14} /> : <UserIcon size={14} />}
      </div>
      <div className={`max-w-[85%] space-y-2 ${isBot ? '' : 'text-left'}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
          isBot
            ? 'bg-ink-700 text-white/90 rounded-br-sm'
            : 'bg-gold-400 text-ink-900 rounded-bl-sm font-medium'
        }`}>
          {m.text}
        </div>

        {m.products && (
          <div className="space-y-2">
            {m.products.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="flex gap-3 p-2 bg-ink-700/60 rounded-xl border border-white/5 hover:border-gold-400/40 transition"
              >
                <img src={p.image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-gold-300 uppercase tracking-wider">{p.brand}</div>
                  <div className="text-xs font-bold text-white line-clamp-2">{p.name}</div>
                  <div className="text-sm font-bold gold-text mt-1">₪{fmt(p.price)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {m.quickReplies && (
          <div className="flex flex-wrap gap-2">
            {m.quickReplies.map((q) => (
              <button
                key={q}
                onClick={() => onQuick(q)}
                className="text-xs px-3 py-1.5 rounded-full bg-gold-400/10 text-gold-300 border border-gold-400/30 hover:bg-gold-400/20 transition"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
