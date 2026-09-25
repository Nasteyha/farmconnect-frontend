import { useEffect, useRef, useState } from 'react'

export function useParallax(intensity = 15) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const element = ref.current
      if (!element) return
      const rect = element.getBoundingClientRect()
      const progress = (rect.top - window.innerHeight) / (window.innerHeight + rect.height)
      setOffset(progress * intensity)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [intensity])

  return { ref, offset }
}