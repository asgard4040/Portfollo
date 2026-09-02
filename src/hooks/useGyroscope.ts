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

    const request = () => {
      const D = window.DeviceOrientationEvent as unknown as
        | { requestPermission?: () => Promise<string> }
        | undefined
      if (D && typeof D.requestPermission === 'function') {
        D.requestPermission()
          .then((p) => p === 'granted' && attach())
          .catch(() => undefined)
      } else {
        attach()
      }
    }

    /* iOS needs a user gesture; any tap enables tilt */
    const onDown = () => {
      request()
      window.removeEventListener('pointerdown', onDown)
    }
    window.addEventListener('pointerdown', onDown)
    request()

    return () => {
      window.removeEventListener('pointerdown', onDown)
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