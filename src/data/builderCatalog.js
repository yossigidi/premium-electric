// ============================================================================
// Builder catalog — the data the smart package builder allocates from.
//
// Two things happen here:
//   1. Existing showroom products are enriched with `brandTier` + `zapLow`
//      (zapLow defaults to the catalog price = today's market-low baseline;
//       phase 3's hybrid Zap lookup will refine it).
//   2. A handful of budget / mid-tier seed products (and a new "dishwashers"
//      type) are added so every appliance type spans all three tiers and a
//      real range of price points — otherwise budget allocation is meaningless.
//
// This is the phase-1 stand-in for the Firestore `products` collection; the
// admin ingest panel (phase 2) will populate the same shape later.
// ============================================================================
import {
  Snowflake, ChefHat, Flame, WashingMachine, Wind, Utensils, Bot, Tv, Music2, Laptop,
  Wallet, Sparkles, Gem, Crown,
} from 'lucide-react'
import { products as showroomProducts } from './products'
import { getIngestedProducts } from '../utils/productStore'

// --- Brand styles (4 independent brand-worlds, NOT a price ladder) -----------
// The customer picks the world they want; the builder stays inside it (with a
// soft fallback when a world doesn't cover a category). Each product's style is
// derived from its brand via BRAND_TIER below — one source of truth.
export const BRAND_TIERS = [
  { id: 'base',     label: 'בסיס',    Icon: Wallet,   blurb: 'מותגים אמינים במחיר חכם' },
  { id: 'designed', label: 'מעוצב',   Icon: Sparkles, blurb: 'מותגי עיצוב ואופי (Smeg)' },
  { id: 'luxury',   label: 'יוקרה',   Icon: Gem,      blurb: 'מותגי יוקרה אקסקלוסיביים' },
  { id: 'premium',  label: 'פרימיום', Icon: Crown,    blurb: 'דגלי השוק המובילים' },
]
export const TIER_IDS = BRAND_TIERS.map((t) => t.id)

// Brand → style. Keyword match, so "LG Signature" → lg, "Samsung Bespoke" → samsung.
const BRAND_TIER = {
  // יוקרה — luxury / exclusive
  miele: 'luxury', gaggenau: 'luxury', liebherr: 'luxury', 'v-zug': 'luxury',
  'bang & olufsen': 'luxury', devialet: 'luxury', 'sub-zero': 'luxury',
  // מעוצב — design statement
  smeg: 'designed',
  // פרימיום — leading premium-popular
  samsung: 'premium', lg: 'premium', bosch: 'premium', aeg: 'premium', sony: 'premium',
  apple: 'premium', sonos: 'premium', dell: 'premium', alienware: 'premium',
  roborock: 'premium', dreame: 'premium', mova: 'premium', ecovacs: 'premium',
  // בסיס — value brands
  electra: 'base', beko: 'base', tcl: 'base', hisense: 'base', lenovo: 'base',
}
const DEFAULT_TIER = 'premium'

/** Resolve a brand name to its style id (falls back to 'premium'). */
export function tierForBrand(brand = '') {
  const b = String(brand).trim().toLowerCase()
  if (BRAND_TIER[b]) return BRAND_TIER[b]
  for (const [key, tier] of Object.entries(BRAND_TIER)) if (b.includes(key)) return tier
  return DEFAULT_TIER
}

// --- Appliance types the customer can multi-select (home goods first) -------
export const applianceTypes = [
  { id: 'refrigerators', label: 'מקרר',        Icon: Snowflake },
  { id: 'ovens',         label: 'תנור',         Icon: ChefHat },
  { id: 'cooktops',      label: 'כיריים',       Icon: Flame },
  { id: 'washers',       label: 'מכונת כביסה',  Icon: WashingMachine },
  { id: 'dryers',        label: 'מייבש',        Icon: Wind },
  { id: 'dishwashers',   label: 'מדיח כלים',    Icon: Utensils },
  { id: 'robot-vacuums', label: 'שואב רובוטי',  Icon: Bot },
  { id: 'tv',            label: 'טלוויזיה',      Icon: Tv },
  { id: 'audio',         label: 'מערכת שמע',     Icon: Music2 },
  { id: 'computers',     label: 'מחשב',          Icon: Laptop },
]

export const applianceLabel = (id) =>
  applianceTypes.find((t) => t.id === id)?.label || id

// Showroom products are classified by brand via tierForBrand() in enrich() below.

// Reusable, real product imagery (transparent PNGs render nicely on white).
const IMG = {
  fridge:     'https://miele.co.il/wp-content/uploads/2021/12/FN28262Dedt_1.png',
  oven:       'https://miele.co.il/wp-content/uploads/2022/01/H7260-BP-B-4.png',
  cooktop:    'https://miele.co.il/wp-content/uploads/2021/12/KM-7465-FL-PNG.png',
  washer:     'https://miele.co.il/wp-content/uploads/2021/12/WWV-980-1.png',
  dryer:      'https://miele.co.il/wp-content/uploads/2021/12/TWJ-660-WP_1.png',
  dishwasher: 'https://miele.co.il/wp-content/uploads/2021/12/WWV-980-2.png',
  tv:         'https://media.us.lg.com/transform/ecomm-PDPGallery-1100x730/04b71684-166f-4333-896a-76e61d94ac78/TV_OLED97G4WUA_gallery-01_3000x3000',
  laptop:     'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/DELL_XPS_13_and_15_%2837080596413%29.jpg/1200px-DELL_XPS_13_and_15_%2837080596413%29.jpg',
}

// --- Seed products: budget + mid tiers + the new dishwashers type ------------
// Minimal shape — enough for the builder card and the allocator.
const SEED_PRODUCTS = [
  // Refrigerators
  { id: 101, category: 'refrigerators', brand: 'Bosch',   name: 'Bosch Series 6 NoFrost 505L', model: 'KGN56XLEB', price: 6490, oldPrice: 7490, image: IMG.fridge, tags: ['NoFrost', '505 ליטר', 'A++'], shortDescription: 'מקרר רחב עם NoFrost ותא VitaFresh לשמירת טריות.' },
  { id: 102, category: 'refrigerators', brand: 'Beko',    name: 'Beko Combi NoFrost 460L',     model: 'RCNA460', price: 3290, image: IMG.fridge, tags: ['NoFrost', '460 ליטר'], shortDescription: 'מקרר מקפיא-תחתון משתלם עם נפח גדול.' },
  // Ovens
  { id: 103, category: 'ovens', brand: 'Bosch',   name: 'Bosch Series 8 Pyrolytic',  model: 'HBG675BS1', price: 4190, oldPrice: 4990, image: IMG.oven, tags: ['פירוליטי', 'PerfectBake'], shortDescription: 'תנור בנוי עם ניקוי פירוליטי וחיישן אפייה.' },
  { id: 104, category: 'ovens', brand: 'Electra', name: 'Electra תנור בנוי 65L',       model: 'EOM65', price: 1890, image: IMG.oven, tags: ['65 ליטר', 'טורבו'], shortDescription: 'תנור בנוי משתלם עם חום טורבו ותאורה.' },
  // Cooktops
  { id: 105, category: 'cooktops', brand: 'Bosch',   name: 'Bosch Series 6 אינדוקציה', model: 'PUE611BB5E', price: 3690, image: IMG.cooktop, tags: ['אינדוקציה', '4 אזורים'], shortDescription: 'כיריים אינדוקציה עם בקרת מגע ו-PowerBoost.' },
  { id: 106, category: 'cooktops', brand: 'Electra', name: 'Electra כיריים אינדוקציה',  model: 'EIC60', price: 1690, image: IMG.cooktop, tags: ['אינדוקציה', '4 אזורים'], shortDescription: 'כיריים אינדוקציה משתלמות עם 4 אזורי בישול.' },
  // Washers
  { id: 107, category: 'washers', brand: 'Bosch',   name: 'Bosch Series 6 WGB 9kg', model: 'WGB256A0IL', price: 3290, oldPrice: 3790, image: IMG.washer, tags: ['9 ק"ג', 'i-DOS'], shortDescription: 'מכונת כביסה עם מינון אוטומטי ומנוע EcoSilence.' },
  { id: 108, category: 'washers', brand: 'Electra', name: 'Electra EcoWash 7kg',     model: 'EW7100', price: 1790, image: IMG.washer, tags: ['7 ק"ג', '1200 סל"ד'], shortDescription: 'מכונת כביסה פרונטלית משתלמת לבית.' },
  // Dryers
  { id: 109, category: 'dryers', brand: 'Bosch',   name: 'Bosch Series 6 Heat Pump', model: 'WQG24100IL', price: 3190, image: IMG.dryer, tags: ['משאבת חום', '8 ק"ג', 'A++'], shortDescription: 'מייבש משאבת חום חסכוני עם תוף ענק.' },
  { id: 110, category: 'dryers', brand: 'Electra', name: 'Electra Heat Pump 7kg',    model: 'EHP70', price: 1690, image: IMG.dryer, tags: ['משאבת חום', '7 ק"ג'], shortDescription: 'מייבש משאבת חום משתלם וחסכוני בחשמל.' },
  // Dishwashers (new type)
  { id: 111, category: 'dishwashers', brand: 'Miele',   name: 'Miele G 7000 AutoDos', model: 'G7110SC', price: 11990, oldPrice: 13990, image: IMG.dishwasher, tags: ['AutoDos', 'PowerDisk', '14 מערכות'], shortDescription: 'מדיח דגל עם מינון אוטומטי ותוצאות מושלמות.' },
  { id: 112, category: 'dishwashers', brand: 'Bosch',   name: 'Bosch Series 6 מדיח',  model: 'SMS6ZCI00E', price: 3690, image: IMG.dishwasher, tags: ['14 מערכות', 'Zeolith'], shortDescription: 'מדיח רחב עם ייבוש Zeolith ותא נוסף לסכו"ם.' },
  { id: 113, category: 'dishwashers', brand: 'Electra', name: 'Electra מדיח כלים 12 מע׳', model: 'EDW12', price: 1990, image: IMG.dishwasher, tags: ['12 מערכות'], shortDescription: 'מדיח כלים משתלם ל-12 מערכות כלים.' },
  // TVs (add mainstream tiers below the luxury OLEDs)
  { id: 114, category: 'tv', brand: 'Hisense', name: 'Hisense U7 Mini-LED 65"', model: '65U7N', price: 4990, oldPrice: 5990, image: IMG.tv, tags: ['Mini-LED', '144Hz', '4K'], shortDescription: 'טלוויזיית Mini-LED עם 144Hz למשחקים וסרטים.' },
  { id: 115, category: 'tv', brand: 'TCL',     name: 'TCL C645 QLED 55"',       model: '55C645', price: 2490, image: IMG.tv, tags: ['QLED', '4K', 'Google TV'], shortDescription: 'טלוויזיית QLED משתלמת עם Google TV.' },
  // Computers (add a budget option)
  { id: 116, category: 'computers', brand: 'Lenovo', name: 'Lenovo IdeaPad Slim 5', model: 'IdeaPad Slim 5 14', price: 3490, image: IMG.laptop, tags: ['Ryzen 7', '16GB', '512GB SSD'], shortDescription: 'לפטופ עבודה ולימודים קליל ומשתלם.' },
  // Smeg — design / retro statement pieces (the "מעוצב" world).
  // TODO: swap IMG.* placeholders for real Smeg product imagery.
  { id: 117, category: 'refrigerators', brand: 'Smeg', name: 'Smeg FAB32 רטרו', model: 'FAB32R', price: 9490, oldPrice: 10990, image: IMG.fridge, tags: ['עיצוב רטרו', '331 ליטר', 'אייקוני'], shortDescription: 'מקרר רטרו אייקוני בעיצוב שנות ה-50 — פריט עיצוב למטבח.' },
  { id: 118, category: 'ovens', brand: 'Smeg', name: 'Smeg Victoria תנור בנוי', model: 'SF6922', price: 6990, image: IMG.oven, tags: ['עיצוב Victoria', 'רב-תכליתי'], shortDescription: 'תנור בנוי בעיצוב Victoria קלאסי עם גימור אסתטי.' },
  { id: 119, category: 'cooktops', brand: 'Smeg', name: 'Smeg כיריים אינדוקציה', model: 'SI2M7643D', price: 4490, image: IMG.cooktop, tags: ['אינדוקציה', 'עיצוב ייחודי'], shortDescription: 'כיריים אינדוקציה בעיצוב Smeg עם בקרת מגע.' },
  { id: 120, category: 'dishwashers', brand: 'Smeg', name: 'Smeg מדיח בעיצוב', model: 'STL323', price: 5490, image: IMG.dishwasher, tags: ['13 מערכות', 'שקט'], shortDescription: 'מדיח כלים בעיצוב Smeg עם 13 מערכות וביצועים שקטים.' },
]

// Enrich a showroom product with builder fields (without mutating the original).
function enrich(p) {
  return {
    ...p,
    brandTier: tierForBrand(p.brand),
    zapLow: p.zapLow ?? p.price, // catalog price === today's market-low baseline
  }
}

const seeded = SEED_PRODUCTS.map((p) => ({
  ...p,
  brandTier: tierForBrand(p.brand), // single source of truth: brand drives style
  rating: p.rating ?? 4.5,
  reviews: p.reviews ?? 0,
  inStock: p.inStock ?? true,
  zapLow: p.zapLow ?? p.price,
}))

/** Base builder catalog: enriched showroom products + seed products. */
export const builderCatalog = [...showroomProducts.map(enrich), ...seeded]

/**
 * Live builder catalog: the base catalog plus any admin-ingested products
 * (phase 2). Read fresh on every call so products approved in the admin panel
 * appear in the builder without a reload.
 */
export const getCatalog = () => [...builderCatalog, ...getIngestedProducts()]

/** All catalog products of a given appliance type. */
export const candidatesFor = (categoryId) =>
  getCatalog().filter((p) => p.category === categoryId && p.inStock !== false)
