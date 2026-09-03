import { useEffect, useState } from 'react'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      window.matchMedia('(pointer: coarse)').matches ||
      window.innerWidth < 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    )
  })

  useEffect(() => {
    const coarseMql = window.matchMedia('(pointer: coarse)')
    const widthMql = window.matchMedia('(max-width: 767px)')

    const check = () => {
      const mobile =
        coarseMql.matches ||
        widthMql.matches ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(mobile)
    }

    check()
    window.addEventListener('resize', check, { passive: true })
    coarseMql.addEventListener?.('change', check)
    widthMql.addEventListener?.('change', check)

    return () => {
      window.removeEventListener('resize', check)
      coarseMql.removeEventListener?.('change', check)
      widthMql.removeEventListener?.('change', check)
    }
  }, [])

  return isMobile
}
