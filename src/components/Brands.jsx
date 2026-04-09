import { brands } from '../data/products'

export default function Brands() {
  return (
    <section id="brands" className="py-20 border-y border-white/5">
      <div className="container-luxe">
        <div className="text-center mb-10">
          <div className="text-xs tracking-[0.3em] uppercase text-gold-300">המותגים שאנחנו מייצגים</div>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
          {brands.map((b) => (
            <div
              key={b}
              className="font-display text-xl md:text-2xl text-white/40 hover:text-gold-300 transition-colors duration-500 cursor-default"
            >
              {b}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
