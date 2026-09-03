import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/* Device-orientation tilt/sway for 3D scenes.
   iOS requires a permission prompt tied to a user gesture, so the listener
   is armed lazily on the first tap. Uses refs — no React re-renders. */

export function useGyroscope() {
  const gyro = useRef<{ beta: number; gamma: number; dispose?: () => void }>({
    beta: 0,
    gamma: 0,
  })
  const available = useRef(false)
  const disposed = useRef(false)

  const attach = () => {
    if (disposed.current || available.current) return
    const handler = (e: DeviceOrientationEvent) => {
      gyro.current.beta = typeof e.beta === 'number' ? e.beta : 0
      gyro.current.gamma = typeof e.gamma === 'number' ? e.gamma : 0
    }
    window.addEventListener('deviceorientation', handler)
    available.current = true
    gyro.current.dispose = () => window.removeEventListener('deviceorientation', handler)
  }

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches
    if (!coarse) return

    const D = window.DeviceOrientationEvent as unknown as
      | { requestPermission?: () => Promise<string> }
      | undefined
    const needsRequest =
      !!D && typeof D.requestPermission === 'function'

    const request = () => {
      if (available.current || disposed.current) return
      /* anything other than 'granted' (pending/denied) is a no-op */
      if (needsRequest) {
        D!.requestPermission!()
          .then((p) => {
            if (p === 'granted') attach()
          })
          .catch(() => {
            /* denied or not a gesture — retry on the next interaction */
          })
      } else {
        attach()
      }
    }

    /* Re-arm on any gesture: iOS needs a user gesture for the permission
       prompt, and it must fire inside one. Listen to pointer/touch/scroll so
       the very first interaction (which is often a scroll on mobile) works. */
    const arm = () => request()
    window.addEventListener('pointerdown', arm)
    window.addEventListener('touchstart', arm)
    window.addEventListener('scroll', arm, { passive: true })
    /* Some Android WebViews deliver events without any gesture; try once. */
    request()

    return () => {
      window.removeEventListener('pointerdown', arm)
      window.removeEventListener('touchstart', arm)
      window.removeEventListener('scroll', arm)
    }
  }, [])

  return {
    sample: () => ({
      sway: THREE.MathUtils.clamp(((gyro.current.gamma - 0) / 45) * 0.9, -0.9, 0.9),
      tilt: THREE.MathUtils.clamp(((gyro.current.beta - 45) / 40) * 0.5, -0.5, 0.55),
    }),
    dispose: () => {
      disposed.current = true
      gyro.current.dispose?.()
    },
  }
}