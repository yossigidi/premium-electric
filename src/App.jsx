import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Categories from './components/Categories'
import FeaturedProducts from './components/FeaturedProducts'
import Showcase from './components/Showcase'
import Brands from './components/Brands'
import Testimonials from './components/Testimonials'
import Newsletter from './components/Newsletter'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="relative">
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <FeaturedProducts />
        <Showcase />
        <Brands />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </div>
  )
}
