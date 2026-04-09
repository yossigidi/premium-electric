import { RouterProvider, useRouter } from './router'
import { CompareProvider } from './contexts/CompareContext'
import { AccessibilityProvider } from './contexts/AccessibilityContext'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import TopBar from './components/TopBar'
import CompareBar from './components/CompareBar'
import AccessibilityPanel from './components/AccessibilityPanel'
import AIChatBot from './components/AIChatBot'

import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import SearchPage from './pages/SearchPage'
import ComparePage from './pages/ComparePage'

function Shell() {
  const { route } = useRouter()
  return (
    <div className="relative">
      <TopBar />
      <Navbar />
      <main>
        {route.name === 'home'    && <HomePage />}
        {route.name === 'product' && <ProductPage id={route.id} />}
        {route.name === 'search'  && <SearchPage />}
        {route.name === 'compare' && <ComparePage />}
      </main>
      <Footer />

      {/* Floating UI */}
      <CompareBar />
      <AccessibilityPanel />
      <AIChatBot />
    </div>
  )
}

export default function App() {
  return (
    <AccessibilityProvider>
      <CompareProvider>
        <RouterProvider>
          <Shell />
        </RouterProvider>
      </CompareProvider>
    </AccessibilityProvider>
  )
}
