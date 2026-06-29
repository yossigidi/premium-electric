import { formatNis } from '../../utils/pricing'

const MIN = 5000
const MAX = 150000
const STEP = 1000
const PRESETS = [15000, 30000, 60000, 100000]

/**
 * Budget input — range slider with a live NIS readout and quick presets.
 * The slider track fill is mirrored for RTL so the gold fill grows from the
 * right (the "start" in Hebrew) as the value increases.
 */
export default function BudgetSlider({ value, onChange }) {
  const pct = Math.round(((value - MIN) / (MAX - MIN)) * 100)

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-gray-500">תקציב כולל לחבילה</span>
        <span className="text-2xl font-bold text-gold-600">₪{formatNis(value)}</span>
      </div>

      <input
        type="range"
        min={MIN}
        max={MAX}
        step={STEP}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="תקציב כולל לחבילה בשקלים"
        className="builder-range mt-4 w-full cursor-pointer"
        style={{
          // Fill from the right side (RTL): gold up to the value, track after.
          background: `linear-gradient(to left, #c9a227 0%, #b8922a ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`,
        }}
      />

      <div className="mt-1 flex justify-between text-[11px] text-gray-400">
        <span>₪{formatNis(MAX)}</span>
        <span>₪{formatNis(MIN)}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
              value === preset
                ? 'border-gold-400 bg-gold-50 text-gold-600'
                : 'border-gray-200 text-gray-500 hover:border-gold-300 hover:text-gold-500'
            }`}
          >
            ₪{formatNis(preset)}
          </button>
        ))}
      </div>
    </div>
  )
}
