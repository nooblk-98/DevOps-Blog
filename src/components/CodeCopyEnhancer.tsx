import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { enhanceCodeBlocksWithCopy } from '@/utils/codeCopy'

export const CodeCopyEnhancer = () => {
  const location = useLocation()
  useEffect(() => {
    // Run once after route change
    const t = setTimeout(() => enhanceCodeBlocksWithCopy(), 0)

    // Observe DOM changes (post content loads async)
    let debounce: number | undefined
    const observer = new MutationObserver(() => {
      if (debounce) window.clearTimeout(debounce)
      debounce = window.setTimeout(() => enhanceCodeBlocksWithCopy(), 50)
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearTimeout(t)
      observer.disconnect()
      if (debounce) window.clearTimeout(debounce)
    }
  }, [location.pathname])
  return null
}
