import { brands } from '../data/products'

export default function Brands() {
  return (
    <section id="brands" className="py-16 border-y border-gray-100">
      <div className="container-luxe">
        <div className="text-center mb-8">
          <div className="text-xs tracking-[0.3em] uppercase text-gold-500 font-semibold">המותגים שאנחנו מייצגים</div>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
          {brands.map((b) => (
            <div key={b} className="text-lg md:text-xl text-gray-300 hover:text-gold-500 transition-colors duration-300 cursor-default font-semibold">{b}</div>
          ))}
        </div>
      </div>
    </section>
  )
}
