import { RouterProvider, useRouter } from './router'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import TopBar from './components/TopBar'

function Shell() {
  const { route } = useRouter()
  return (
    <div className="relative">
      <TopBar />
      <Navbar />
      <main>
        {route.name === 'home'    && <HomePage />}
        {route.name === 'product' && <ProductPage id={route.id} />}
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <RouterProvider>
      <Shell />
    </RouterProvider>
  )
}
