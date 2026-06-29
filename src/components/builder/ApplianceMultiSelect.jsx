import { Check } from 'lucide-react'
import { applianceTypes } from '../../data/builderCatalog'

/**
 * Appliance multi-select — toggle cards. Each acts as a checkbox.
 */
export default function ApplianceMultiSelect({ selected, onToggle }) {
  return (
    <div
      role="group"
      aria-label="בחירת סוגי מכשירים לחבילה"
      className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5"
    >
      {applianceTypes.map((type) => {
        const Icon = type.Icon
        const isOn = selected.includes(type.id)
        return (
          <button
            key={type.id}
            type="button"
            role="checkbox"
            aria-checked={isOn}
            onClick={() => onToggle(type.id)}
            className={`group relative flex flex-col items-center gap-2 rounded-2xl border p-3.5 cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 ${
              isOn
                ? 'border-gold-400 bg-gold-50 shadow-gold-glow'
                : 'border-gray-200 bg-white hover:border-gold-300 hover:bg-gold-50/40'
            }`}
          >
            {isOn && (
              <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold-gradient text-white">
                <Check size={11} strokeWidth={3} />
              </span>
            )}
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200 ${
                isOn ? 'bg-white text-gold-500 shadow-card' : 'bg-gray-100 text-gray-500 group-hover:text-gold-500'
              }`}
            >
              <Icon size={19} />
            </span>
            <span className={`text-xs font-semibold ${isOn ? 'text-gold-600' : 'text-gray-700'}`}>
              {type.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
