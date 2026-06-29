import { BRAND_TIERS } from '../../data/builderCatalog'

/**
 * Brand-tier preference — three chips (budget → designed → premium).
 * Radio-group semantics for keyboard + screen-reader users.
 */
export default function BrandTierSelect({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="העדפת רמת מותג" className="grid grid-cols-3 gap-3">
      {BRAND_TIERS.map((tier) => {
        const selected = value === tier.id
        const Icon = tier.Icon
        return (
          <button
            key={tier.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(tier.id)}
            className={`group relative flex flex-col items-center text-center gap-2 rounded-2xl border p-4 cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 ${
              selected
                ? 'border-gold-400 bg-gold-50 shadow-gold-glow'
                : 'border-gray-200 bg-white hover:border-gold-300 hover:bg-gold-50/40'
            }`}
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-200 ${
                selected ? 'bg-gold-gradient text-white' : 'bg-gray-100 text-gray-500 group-hover:text-gold-500'
              }`}
            >
              <Icon size={20} />
            </span>
            <span className={`text-sm font-bold ${selected ? 'text-gold-600' : 'text-gray-800'}`}>
              {tier.label}
            </span>
            <span className="text-[11px] leading-tight text-gray-400">{tier.blurb}</span>
          </button>
        )
      })}
    </div>
  )
}
