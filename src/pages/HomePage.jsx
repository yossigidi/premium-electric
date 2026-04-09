import Hero from '../components/Hero'
import Categories from '../components/Categories'
import FeaturedProducts from '../components/FeaturedProducts'
import Showcase from '../components/Showcase'
import Brands from '../components/Brands'
import Testimonials from '../components/Testimonials'
import Newsletter from '../components/Newsletter'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <Showcase />
      <Brands />
      <Testimonials />
      <Newsletter />
    </>
  )
}
