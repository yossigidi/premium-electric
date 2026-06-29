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
  Wallet, Gem, Crown,
} from 'lucide-react'
import { products as showroomProducts } from './products'
import { getIngestedProducts } from '../utils/productStore'

// --- Brand-tier definitions (ascending price/prestige) ----------------------
export const BRAND_TIERS = [
  { id: 'budget',   label: 'תקציב',  Icon: Wallet, blurb: 'מותגים אמינים, מחיר חכם' },
  { id: 'designed', label: 'מעוצב',  Icon: Gem,    blurb: 'עיצוב ומפרט מתקדמים' },
  { id: 'premium',  label: 'פרמיום', Icon: Crown,  blurb: 'דגלי השוק, יוקרה מלאה' },
]
export const TIER_IDS = BRAND_TIERS.map((t) => t.id)
export const TIER_RANK = { budget: 0, designed: 1, premium: 2 }

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

// --- Tier classification for the existing showroom products -----------------
const TIER_BY_ID = {
  1: 'designed', 2: 'premium', 3: 'premium',          // TVs
  4: 'premium', 5: 'designed', 6: 'budget',           // Audio
  7: 'premium', 8: 'designed', 9: 'premium',          // Computers
  10: 'premium', 11: 'premium', 12: 'premium',        // Refrigerators
  13: 'premium', 14: 'premium',                       // Cooktops
  15: 'premium', 16: 'premium',                       // Ovens
  17: 'premium', 18: 'premium',                       // Washers
  19: 'premium', 20: 'designed',                      // Dryers
  21: 'designed', 22: 'budget', 23: 'premium', 24: 'designed', // Robot vacuums
}

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
  { id: 101, category: 'refrigerators', brand: 'Bosch',   name: 'Bosch Series 6 NoFrost 505L', model: 'KGN56XLEB', brandTier: 'designed', price: 6490, oldPrice: 7490, image: IMG.fridge, tags: ['NoFrost', '505 ליטר', 'A++'], shortDescription: 'מקרר רחב עם NoFrost ותא VitaFresh לשמירת טריות.' },
  { id: 102, category: 'refrigerators', brand: 'Beko',    name: 'Beko Combi NoFrost 460L',     model: 'RCNA460', brandTier: 'budget',   price: 3290, image: IMG.fridge, tags: ['NoFrost', '460 ליטר'], shortDescription: 'מקרר מקפיא-תחתון משתלם עם נפח גדול.' },
  // Ovens
  { id: 103, category: 'ovens', brand: 'Bosch',   name: 'Bosch Series 8 Pyrolytic',  model: 'HBG675BS1', brandTier: 'designed', price: 4190, oldPrice: 4990, image: IMG.oven, tags: ['פירוליטי', 'PerfectBake'], shortDescription: 'תנור בנוי עם ניקוי פירוליטי וחיישן אפייה.' },
  { id: 104, category: 'ovens', brand: 'Electra', name: 'Electra תנור בנוי 65L',       model: 'EOM65', brandTier: 'budget',   price: 1890, image: IMG.oven, tags: ['65 ליטר', 'טורבו'], shortDescription: 'תנור בנוי משתלם עם חום טורבו ותאורה.' },
  // Cooktops
  { id: 105, category: 'cooktops', brand: 'Bosch',   name: 'Bosch Series 6 אינדוקציה', model: 'PUE611BB5E', brandTier: 'designed', price: 3690, image: IMG.cooktop, tags: ['אינדוקציה', '4 אזורים'], shortDescription: 'כיריים אינדוקציה עם בקרת מגע ו-PowerBoost.' },
  { id: 106, category: 'cooktops', brand: 'Electra', name: 'Electra כיריים אינדוקציה',  model: 'EIC60', brandTier: 'budget',   price: 1690, image: IMG.cooktop, tags: ['אינדוקציה', '4 אזורים'], shortDescription: 'כיריים אינדוקציה משתלמות עם 4 אזורי בישול.' },
  // Washers
  { id: 107, category: 'washers', brand: 'Bosch',   name: 'Bosch Series 6 WGB 9kg', model: 'WGB256A0IL', brandTier: 'designed', price: 3290, oldPrice: 3790, image: IMG.washer, tags: ['9 ק"ג', 'i-DOS'], shortDescription: 'מכונת כביסה עם מינון אוטומטי ומנוע EcoSilence.' },
  { id: 108, category: 'washers', brand: 'Electra', name: 'Electra EcoWash 7kg',     model: 'EW7100', brandTier: 'budget',   price: 1790, image: IMG.washer, tags: ['7 ק"ג', '1200 סל"ד'], shortDescription: 'מכונת כביסה פרונטלית משתלמת לבית.' },
  // Dryers
  { id: 109, category: 'dryers', brand: 'Bosch',   name: 'Bosch Series 6 Heat Pump', model: 'WQG24100IL', brandTier: 'designed', price: 3190, image: IMG.dryer, tags: ['משאבת חום', '8 ק"ג', 'A++'], shortDescription: 'מייבש משאבת חום חסכוני עם תוף ענק.' },
  { id: 110, category: 'dryers', brand: 'Electra', name: 'Electra Heat Pump 7kg',    model: 'EHP70', brandTier: 'budget',   price: 1690, image: IMG.dryer, tags: ['משאבת חום', '7 ק"ג'], shortDescription: 'מייבש משאבת חום משתלם וחסכוני בחשמל.' },
  // Dishwashers (new type)
  { id: 111, category: 'dishwashers', brand: 'Miele',   name: 'Miele G 7000 AutoDos', model: 'G7110SC', brandTier: 'premium',  price: 11990, oldPrice: 13990, image: IMG.dishwasher, tags: ['AutoDos', 'PowerDisk', '14 מערכות'], shortDescription: 'מדיח דגל עם מינון אוטומטי ותוצאות מושלמות.' },
  { id: 112, category: 'dishwashers', brand: 'Bosch',   name: 'Bosch Series 6 מדיח',  model: 'SMS6ZCI00E', brandTier: 'designed', price: 3690, image: IMG.dishwasher, tags: ['14 מערכות', 'Zeolith'], shortDescription: 'מדיח רחב עם ייבוש Zeolith ותא נוסף לסכו"ם.' },
  { id: 113, category: 'dishwashers', brand: 'Electra', name: 'Electra מדיח כלים 12 מע׳', model: 'EDW12', brandTier: 'budget',   price: 1990, image: IMG.dishwasher, tags: ['12 מערכות'], shortDescription: 'מדיח כלים משתלם ל-12 מערכות כלים.' },
  // TVs (add mainstream tiers below the luxury OLEDs)
  { id: 114, category: 'tv', brand: 'Hisense', name: 'Hisense U7 Mini-LED 65"', model: '65U7N', brandTier: 'designed', price: 4990, oldPrice: 5990, image: IMG.tv, tags: ['Mini-LED', '144Hz', '4K'], shortDescription: 'טלוויזיית Mini-LED עם 144Hz למשחקים וסרטים.' },
  { id: 115, category: 'tv', brand: 'TCL',     name: 'TCL C645 QLED 55"',       model: '55C645', brandTier: 'budget',   price: 2490, image: IMG.tv, tags: ['QLED', '4K', 'Google TV'], shortDescription: 'טלוויזיית QLED משתלמת עם Google TV.' },
  // Computers (add a budget option)
  { id: 116, category: 'computers', brand: 'Lenovo', name: 'Lenovo IdeaPad Slim 5', model: 'IdeaPad Slim 5 14', brandTier: 'budget', price: 3490, image: IMG.laptop, tags: ['Ryzen 7', '16GB', '512GB SSD'], shortDescription: 'לפטופ עבודה ולימודים קליל ומשתלם.' },
]

// Enrich a showroom product with builder fields (without mutating the original).
function enrich(p) {
  return {
    ...p,
    brandTier: TIER_BY_ID[p.id] || 'premium',
    zapLow: p.zapLow ?? p.price, // catalog price === today's market-low baseline
  }
}

const seeded = SEED_PRODUCTS.map((p) => ({
  ...p,
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
