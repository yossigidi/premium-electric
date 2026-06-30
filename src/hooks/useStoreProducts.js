import { useState, useEffect } from 'react'
import { getIngestedProducts, subscribeProducts } from '../utils/productStore'

/**
 * The storefront product source: the products that actually live in the D1
 * database (admin-ingested), kept reactive. Re-renders the consuming component
 * whenever the product cache changes — on initial D1 sync and on every admin
 * save — so newly added products appear across the site without a reload.
 */
export function useStoreProducts() {
  const [list, setList] = useState(getIngestedProducts)
  useEffect(() => subscribeProducts(setList), [])
  return list
}
