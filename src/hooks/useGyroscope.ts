import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/* Device-orientation tilt/sway for 3D scenes.
   iOS requires a permission prompt tied to a user gesture, so the listener
   is armed lazily on the first tap. Uses refs — no React re-renders. */

export function useGyroscope() {
  const gyro = useRef<{ alpha: number; beta: number; gamma: number; dispose?: () => void }>({
    alpha: 0,
    beta: 0,
    gamma: 0,
  })
  const available = useRef(false)
  const disposed = useRef(false)

  const attach = () => {
    if (disposed.current || available.current) return
    const handler = (e: DeviceOrientationEvent) => {
      gyro.current.alpha = typeof e.alpha === 'number' ? e.alpha : gyro.current.alpha
      gyro.current.beta = typeof e.beta === 'number' ? e.beta : gyro.current.beta
      gyro.current.gamma = typeof e.gamma === 'number' ? e.gamma : gyro.current.gamma
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

    /* Re-arm on any real gesture: iOS only grants motion permission inside a
       user gesture (pointer/touch/click), and the FIRST in-gesture request is
       the one that matters. Crucially, we must NOT request on mount — outside
       a gesture iOS silently ignores/fails it, which can block later calls.
       `scroll` is not a valid gesture for the prompt, so it is left out here. */
    const arm = () => request()
    window.addEventListener('pointerdown', arm)
    window.addEventListener('touchstart', arm, { passive: true })
    window.addEventListener('touchend', arm, { passive: true })
    window.addEventListener('click', arm)

    /* No permission API (e.g. Android Chrome/WebView): just attach now. */
    if (!needsRequest) attach()

    return () => {
      window.removeEventListener('pointerdown', arm)
      window.removeEventListener('touchstart', arm)
      window.removeEventListener('touchend', arm)
      window.removeEventListener('click', arm)
    }
  }, [])

  return {
    sample: () => ({
      sway: THREE.MathUtils.clamp(((gyro.current.gamma - 0) / 45) * 0.9, -0.9, 0.9),
      tilt: THREE.MathUtils.clamp(((gyro.current.beta - 45) / 40) * 0.5, -0.5, 0.55),
      /* rotation around the vertical axis (compass direction) — the most
         natural way people turn a phone, so the head should follow it */
      turn: THREE.MathUtils.clamp(((gyro.current.alpha - 0) / 90) * 0.9, -0.9, 0.9),
    }),
    dispose: () => {
      disposed.current = true
      gyro.current.dispose?.()
    },
  }
}