import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useGyroscope } from '../hooks/useGyroscope'
import { useContent } from '../store/ContentContext'
import { portalScreen, currentIdAt } from '../portal/screen'
import { initRouter, destroyRouter } from '../portal/router'
import BackgroundFX from './BackgroundFX'

/* The "inside the computer" portal.
   The page starts with the Hero and 3D retro computer.
   Scrolling immediately dollies the camera directly into the CRT monitor screen.
   As you enter, the Hero text gracefully fades/recedes, the 3D model pivots to face
   straight-on, and the inner website scales smoothly out from the CRT screen with
   a luminous portal warp. Once inside, scrolling scrubs through the inner sections.
   Scrolling back up seamlessly reverses out of the screen back to the Hero pose. */

const MODEL_URL = import.meta.env.BASE_URL + 'pc.glb'

const CAM_FOV = 50
const CAM_REST_Z = 7.5
const DEG = Math.PI / 180
const TAN_HALF_FOV = Math.tan(THREE.MathUtils.degToRad(CAM_FOV / 2))

/* The screen mesh in pc.glb is named "Plane" and carries a full 0..1 UV map, so
   its glass corners are read straight off the geometry at load time rather than
   hard-coded — see `readGlass` below. */
const GLASS_MESH = 'Plane'
/* fraction of the glass mesh that is actually visible through the bezel */
const GLASS_INSET = 0.9

/* Solve the projective transform taking the four corners of a `w` x `h` box to
   an arbitrary quad, and emit it as a CSS matrix3d. This is what lets the page
   sit *on* the tilted glass instead of floating in front of it. */
function quadToMatrix3d(
  w: number,
  h: number,
  dst: { x: number; y: number }[],
): string {
  const src = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ]
  /* 8 unknowns: x' = (a x + b y + c) / (g x + h y + 1), same for y' */
  const A: number[][] = []
  const B: number[] = []
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i]
    const { x: u, y: v } = dst[i]
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y])
    B.push(u)
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y])
    B.push(v)
  }
  /* Gaussian elimination with partial pivoting */
  for (let i = 0; i < 8; i++) {
    let piv = i
    for (let r = i + 1; r < 8; r++) {
      if (Math.abs(A[r][i]) > Math.abs(A[piv][i])) piv = r
    }
    if (piv !== i) {
      ;[A[i], A[piv]] = [A[piv], A[i]]
      ;[B[i], B[piv]] = [B[piv], B[i]]
    }
    const d = A[i][i]
    if (Math.abs(d) < 1e-12) return 'none'
    for (let c = i; c < 8; c++) A[i][c] /= d
    B[i] /= d
    for (let r = 0; r < 8; r++) {
      if (r === i) continue
      const f = A[r][i]
      if (!f) continue
      for (let c = i; c < 8; c++) A[r][c] -= f * A[i][c]
      B[r] -= f * B[i]
    }
  }
  const [a, b, c, d, e, f, g, hh] = B
  /* column-major matrix3d */
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${hh},0,0,1,0,${c},${f},0,1)`
}
const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function PinnedScreen({
  hero,
  children,
}: {
  hero?: React.ReactNode
  children: React.ReactNode
}) {
  const { content } = useContent()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const heroHostRef = useRef<HTMLDivElement | null>(null)
  const canvasHostRef = useRef<HTMLDivElement | null>(null)
  const worldRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)
  const hintRef = useRef<HTMLDivElement | null>(null)
  const insideChipRef = useRef<HTMLSpanElement | null>(null)
  const glassFxRef = useRef<HTMLDivElement | null>(null)
  const gyro = useGyroscope()

  /* mirror the saved settings into the live console the 3D effect reads */
  const synced = useRef('')
  const modelJson = JSON.stringify(content.model3D)
  if (synced.current !== modelJson) {
    synced.current = modelJson
    portalScreen.setModel(content.model3D)
  }

  useEffect(() => {
    const root = rootRef.current
    const heroHost = heroHostRef.current
    const canvasHost = canvasHostRef.current
    const world = worldRef.current
    const inner = innerRef.current
    const glassFx = glassFxRef.current
    if (!root || !canvasHost || !world || !inner) return

    initRouter()

    /* ---- three.js setup ---- */
    /* Coarse (touch) devices have high-dpi, power-hungry GPUs. Skip MSAA
       antialiasing there — it's the biggest single fill cost on mobile GPUs
       and imperceptible at phone pixel density — and cap the pixel ratio. */
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const mobileCap = coarse ? 1 : 2
    const dprCap = REDUCED ? 1 : mobileCap
    let renderer: THREE.WebGLRenderer | null = null
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !coarse && !REDUCED })
    } catch {
      /* WebGL unavailable fallback */
    }
    if (renderer) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap))
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      canvasHost.appendChild(renderer.domElement)
    }

    const scene = new THREE.Scene()
    scene.background = null
    const camera = new THREE.PerspectiveCamera(CAM_FOV, 1, 0.1, 40)
    camera.position.set(0, 0, CAM_REST_Z)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1a1a, 1.35))
    const key = new THREE.DirectionalLight(0xffffff, 0.85)
    key.position.set(-2, 3, 4)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xffffff, 0.45)
    fill.position.set(3, 2, 2)
    scene.add(fill)

    const pivot = new THREE.Group() // slides from rest → center as camera dollies
    const spinner = new THREE.Group() // idle + gyro rotation
    const modelBox = new THREE.Group()
    pivot.add(spinner)
    spinner.add(modelBox)
    scene.add(pivot)

    /* raw, normalized corners of the model, plus a decimated point cloud used
       to measure what the camera actually sees (the AABB is far too generous
       for a machine sitting at an angle) */
    const dims = {
      corners: [] as [number, number, number][],
      cloud: new Float32Array(0),
      /* glass corners in modelBox space, ordered bottom-left, bottom-right,
         top-right, top-left as the viewer sees them once the machine faces
         front (yaw -90deg, where screen-horizontal = -z and depth = +x) */
      glass: [] as [number, number, number][],
      glassW: 1,
      glassH: 1,
      glassY: 0,
      glassZ: 0,
      ready: false,
    }
    let worldScale = 1
  
    new GLTFLoader()
      .loadAsync(MODEL_URL)
      .then((gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const maxDim = Math.max(
          box.max.x - box.min.x,
          box.max.y - box.min.y,
          box.max.z - box.min.z,
        )
        const k = 1 / maxDim
        model.scale.setScalar(k)
        model.position.sub(center.clone().multiplyScalar(k))
        modelBox.add(model)

        dims.corners = [
          [box.min.x, box.min.y, box.min.z],
          [box.max.x, box.min.y, box.min.z],
          [box.min.x, box.max.y, box.min.z],
          [box.max.x, box.max.y, box.min.z],
          [box.min.x, box.min.y, box.max.z],
          [box.max.x, box.min.y, box.max.z],
          [box.min.x, box.max.y, box.max.z],
          [box.max.x, box.max.y, box.max.z],
        ].map(([cx, cy, cz]) => [k * (cx - center.x), k * (cy - center.y), k * (cz - center.z)])

        /* sample vertices into modelBox-local space, roughly 900 per mesh */
        modelBox.updateWorldMatrix(true, true)
        const toLocal = new THREE.Matrix4().copy(modelBox.matrixWorld).invert()
        const sample: number[] = []
        const v = new THREE.Vector3()
        model.updateWorldMatrix(true, true)
        model.traverse((o) => {
          const mesh = o as THREE.Mesh
          if (!mesh.isMesh) return
          const attr = (mesh.geometry as THREE.BufferGeometry).getAttribute('position')
          if (!attr) return
          const step = Math.max(1, Math.floor(attr.count / 900))
          for (let i = 0; i < attr.count; i += step) {
            v.fromBufferAttribute(attr as THREE.BufferAttribute, i)
              .applyMatrix4(mesh.matrixWorld)
              .applyMatrix4(toLocal)
            sample.push(v.x, v.y, v.z)
          }
        })
        dims.cloud = new Float32Array(sample)

        /* the four UV corners of the glass, in modelBox space */
        model.traverse((o) => {
          const mesh = o as THREE.Mesh
          if (!mesh.isMesh || mesh.name !== GLASS_MESH || dims.glass.length) return
          const geo = mesh.geometry as THREE.BufferGeometry
          const uv = geo.getAttribute('uv')
          const pos = geo.getAttribute('position')
          if (!uv || !pos) return
          const want: [number, number][] = [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
          ]
          const best = want.map(() => ({ d: Infinity, i: 0 }))
          for (let i = 0; i < uv.count; i++) {
            const u = uv.getX(i)
            const vv = uv.getY(i)
            for (let k = 0; k < 4; k++) {
              const d = (u - want[k][0]) ** 2 + (vv - want[k][1]) ** 2
              if (d < best[k].d) best[k] = { d, i }
            }
          }
          const pts = best.map((b) =>
            new THREE.Vector3()
              .fromBufferAttribute(pos as THREE.BufferAttribute, b.i)
              .applyMatrix4(mesh.matrixWorld)
              .applyMatrix4(toLocal),
          )
          /* sort into screen order: horizontal is -z, vertical is y */
          const byV = [...pts].sort((a, b) => a.y - b.y)
          const low = byV.slice(0, 2).sort((a, b) => -a.z - -b.z)
          const high = byV.slice(2).sort((a, b) => -a.z - -b.z)
          const ordered = [low[0], low[1], high[1], high[0]] // bl, br, tr, tl
          dims.glass = ordered.map((q) => [q.x, q.y, q.z] as [number, number, number])
          dims.glassW = Math.abs(-ordered[1].z - -ordered[0].z)
          dims.glassH = Math.abs(ordered[3].y - ordered[0].y)
          dims.glassY = (ordered[0].y + ordered[3].y) / 2
          dims.glassZ = Math.max(...ordered.map((q) => q.x))
        })

        dims.ready = true

        /* Ensure all computer parts are solid and have clean, natural rendering */
        modelBox.traverse((o) => {
          if (!(o instanceof THREE.Mesh)) return
          const mats = Array.isArray(o.material) ? o.material : [o.material]
          for (const m of mats) {
            m.transparent = false
            m.depthWrite = true
            m.depthTest = true
            if ('emissive' in m && m.emissive) {
              m.emissive.set(0x000000)
              if ('emissiveIntensity' in m) m.emissiveIntensity = 0
            }
            m.needsUpdate = true
          }
        })

        frameMachine()
        apply(window.scrollY)
      })
      .catch(() => undefined)

    /* ---- layout + measurement ---- */
    let restX = 1.6
    let restY = 0.0
    let zInside = 2.1
    /* true once the user has fully entered the screen and the inner page (which
       is opaque) covers the 3D machine — used to skip GPU renders then */
    let insideNow = false

    const measure = () => {
      let measuredH = 0
      const sectionEls = Array.from(inner.querySelectorAll<HTMLElement>('section, footer'))
      if (sectionEls.length > 0) {
        const lastEl = sectionEls[sectionEls.length - 1]
        measuredH = lastEl.offsetTop + lastEl.offsetHeight
      }
      const rawH = Math.max(measuredH, inner.scrollHeight, inner.offsetHeight)
      const worldH = Math.max(rawH, 4800)
      const innerHeight = window.innerHeight || 800
      const enterPx = Math.max(200, portalScreen.model().enterVh * innerHeight)
      const travelMax = Math.max(3000, worldH - innerHeight)
      const range = Math.max(1, enterPx + travelMax)
      const pEnter = enterPx / range

      const sections = Array.from(inner.querySelectorAll<HTMLElement>('section[id]')).map(
        (el) => ({ id: el.id, offset: el.offsetTop }),
      )

      portalScreen.set({
        start: 0,
        enterPx,
        travelMax,
        range,
        pEnter,
        worldH,
        innerHeight,
        sections,
      })

      document.documentElement.style.setProperty('--enter-height', `${enterPx}px`)
      document.documentElement.style.setProperty('--world-height', `${travelMax}px`)
    }

    const frameMachine = () => {
      if (renderer) {
        const w = canvasHost.clientWidth
        const h = canvasHost.clientHeight
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }

      const aspect = canvasHost.clientWidth / Math.max(1, canvasHost.clientHeight)
      const visH = 2 * CAM_REST_Z * TAN_HALF_FOV
      const halfW = (visH * aspect) / 2
      const halfH = visH / 2

      if (!dims.ready) {
        worldScale = 1
        pivot.scale.setScalar(worldScale)
        restX = aspect < 0.9 ? 0 : halfW * 0.45
        restY = 0
        pivot.position.set(restX, restY, 0)
        spinner.rotation.y = portalScreen.model().yawDeg * DEG
        zInside = 2.2
        return
      }

      const m = portalScreen.model()

      /* yaw-aware extents */
      const yaw = m.yawDeg * DEG
      const cosY = Math.cos(yaw)
      const sinY = Math.sin(yaw)
      let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity
      for (const [x, y, z] of dims.corners) {
        const rx = x * cosY + z * sinY
        xMin = Math.min(xMin, rx)
        xMax = Math.max(xMax, rx)
        yMin = Math.min(yMin, y)
        yMax = Math.max(yMax, y)
      }
      const ww = xMax - xMin
      const hw = yMax - yMin

      /* The corner math above is the AABB of the rotated *bounding box*: it
         over-estimates a machine standing at an angle and is symmetric about the
         origin, so centring it leaves the silhouette visibly off to one side.
         Pose the sampled cloud at the rest yaw once, then project it. Unlike the
         bounding box, this is the shape the viewer actually sees. */
      const cloud = dims.cloud
      const posed = new Float32Array(cloud.length)
      const tiltCos = Math.cos(-0.04)
      const tiltSin = Math.sin(-0.04)
      for (let i = 0; i < cloud.length; i += 3) {
        const px0 = cloud[i]
        const py0 = cloud[i + 1]
        const pz0 = cloud[i + 2]
        /* yaw about Y, then the small resting tilt about X */
        const rx = px0 * cosY + pz0 * sinY
        const rz = -px0 * sinY + pz0 * cosY
        posed[i] = rx
        posed[i + 1] = py0 * tiltCos - rz * tiltSin
        posed[i + 2] = py0 * tiltSin + rz * tiltCos
      }

      /* NDC bounds of the posed machine at scale `sc` and pivot (px, py),
         measured from the camera's *rest* position so a mid-scroll resize still
         solves for the correct resting pose */
      const probe = new THREE.Vector3()
      const ndcBounds = (sc: number, px: number, py: number) => {
        const camZ = camera.position.z
        camera.position.z = CAM_REST_Z
        camera.updateMatrixWorld(true)
        let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
        for (let i = 0; i < posed.length; i += 3) {
          probe.set(posed[i] * sc + px, posed[i + 1] * sc + py, posed[i + 2] * sc)
          probe.project(camera)
          if (probe.x < x0) x0 = probe.x
          if (probe.x > x1) x1 = probe.x
          if (probe.y < y0) y0 = probe.y
          if (probe.y > y1) y1 = probe.y
        }
        camera.position.z = camZ
        camera.updateMatrixWorld(true)
        return { x0, x1, y0, y1 }
      }

      /* size scaling */
      const isMobile = aspect < 0.95 || window.innerWidth < 768
      let s: number

      if (isMobile) {
        /* binary-search the scale whose *silhouette* fits the safe box */
        const FILL_X = 0.80
        const FILL_Y = 0.50
        let lo = 0.001
        let hi = 60
        for (let it = 0; it < 22; it++) {
          const mid = (lo + hi) / 2
          const b = ndcBounds(mid, 0, 0)
          const fits = b.x1 - b.x0 <= 2 * FILL_X && b.y1 - b.y0 <= 2 * FILL_Y
          if (fits) lo = mid
          else hi = mid
        }
        s = lo
      } else {
        const sH = (m.scale * visH) / hw
        const sW = (0.92 * 2 * halfW) / ww
        s = Math.min(sH, sW)
      }

      worldScale = s
      pivot.scale.setScalar(s)

      /* rest position */
      if (isMobile) {
        /* projected x is exactly linear in pivot.x, so one probe pair solves it */
        const a = ndcBounds(s, 0, 0)
        const b = ndcBounds(s, 1, 0)
        const ca = (a.x0 + a.x1) / 2
        const cb = (b.x0 + b.x1) / 2
        restX = Math.abs(cb - ca) > 1e-6 ? -ca / (cb - ca) : 0

        /* sit a little below the optical centre, under the hero copy, but never
           let an edge leave the viewport */
        const TARGET_CY = -0.44
        const c0 = ndcBounds(s, restX, 0)
        const c1 = ndcBounds(s, restX, -1)
        const cy0 = (c0.y0 + c0.y1) / 2
        const cy1 = (c1.y0 + c1.y1) / 2
        let dy = Math.abs(cy1 - cy0) > 1e-6 ? (cy0 - TARGET_CY) / (cy1 - cy0) : 0
        /* clamp: keep the bottom above -0.97 NDC */
        const perUnit = cy1 - cy0 // NDC per +1 world unit... measured at -1
        if (perUnit < 0) {
          const bottomAt = (d: number) => c0.y0 - perUnit * d
          while (dy < 0 && bottomAt(dy) < -0.97) dy += 0.02
        }
        restY = Math.min(0, dy)
      } else {
        // on desktop: place nicely in the right half of the hero
        const maxX = Math.max(0.001, halfW * 0.92 - (s * ww) / 2)
        const maxY = Math.max(0.001, halfH * 0.7 - (s * hw) / 2)
        const px = Math.min(1, Math.abs(m.posX))
        const py = Math.min(1, Math.abs(m.posY))
        restX = m.posX >= 0 ? maxX * px : -maxX * px
        restY = m.posY >= 0 ? maxY * py : -maxY * py
      }

      /* dolly target: camera enters directly through the screen glass from the front */
      const screenH = dims.glassH * s
      const screenW = dims.glassW * s
      const zW = screenW / (2 * aspect * TAN_HALF_FOV)
      const zH = screenH / (2 * TAN_HALF_FOV)
      /* the glass leans back — stop in front of its nearest point */
      zInside = dims.glassZ * s + Math.max(0.65, Math.min(zW, zH) * 0.92)

      measure()
      apply(window.scrollY)
    }
    frameMachine()

    const ro = new ResizeObserver(() => {
      measure()
      apply(window.scrollY)
    })
    ro.observe(inner)

    /* last edge-softness written to the mask, so the string is only rebuilt
       when it actually changes rather than on every scroll frame */
    let lastSoft = -1

    /* scratch vectors reused every frame for the glass projection */
    const quadV = [0, 1, 2, 3].map(() => new THREE.Vector3())
    const quadPx = [0, 1, 2, 3].map(() => ({ x: 0, y: 0 }))

    /* Corners of the device-shaped rectangle that actually shows the page,
       fitted inside the glass: on a phone this is a portrait window, on a
       desktop it very nearly fills the glass. Returned in model space. */
    const glassCorners = (viewAspect: number): [number, number, number][] => {
      /* u runs along the glass width, v along its height, both 0..1 */
      const glassAspect = dims.glassW / dims.glassH
      let u = 1
      let v = 1
      if (viewAspect > glassAspect) v = glassAspect / viewAspect
      else u = viewAspect / glassAspect
      /* the plane runs on under the bezel, so keep the page off its rim */
      u *= GLASS_INSET
      v *= GLASS_INSET
      const u0 = (1 - u) / 2
      const u1 = 1 - u0
      const v0 = (1 - v) / 2
      const v1 = 1 - v0
      /* bilinear blend of the glass quad: A=bl, B=br, C=tr, D=tl */
      const [A, B, C, D] = dims.glass
      const at = (uu: number, vv: number): [number, number, number] => [
        (A[0] * (1 - uu) + B[0] * uu) * (1 - vv) + (D[0] * (1 - uu) + C[0] * uu) * vv,
        (A[1] * (1 - uu) + B[1] * uu) * (1 - vv) + (D[1] * (1 - uu) + C[1] * uu) * vv,
        (A[2] * (1 - uu) + B[2] * uu) * (1 - vv) + (D[2] * (1 - uu) + C[2] * uu) * vv,
      ]
      /* keep the same winding: bottom-left, bottom-right, top-right, top-left */
      return [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)]
    }

    /* ---- smooth easing helpers ---- */
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    /* 0 below `a`, 1 above `b`, smooth in between */
    const ramp = (v: number, a: number, b: number) => {
      const t = Math.min(1, Math.max(0, (v - a) / Math.max(1e-6, b - a)))
      return t * t * (3 - 2 * t)
    }

    const apply = (y: number) => {
      const L = portalScreen.get()
      if (!L) return

      const enterPx = L.enterPx
      const eEnterRaw = Math.min(1, Math.max(0, y / Math.max(1, enterPx)))
      const eEnter = easeInOutCubic(eEnterRaw)
      const isInside = y >= enterPx
      insideNow = isInside

      /* 1. Hero layer fading & floating out (only while it's on screen) */
      if (heroHost) {
        const heroFade = Math.min(1, Math.max(0, y / (enterPx * 0.55)))
        const heroOpacity = isInside ? 0 : 1 - heroFade
        heroHost.style.opacity = String(heroOpacity)
        heroHost.style.transform = `translate3d(0, ${-heroFade * 50}px, 0) scale(${1 - heroFade * 0.04})`
        heroHost.style.pointerEvents = heroOpacity > 0.08 ? 'auto' : 'none'
        heroHost.style.visibility = heroOpacity > 0 ? 'visible' : 'hidden'
      }

      /* Once fully inside, the opaque page covers the 3D machine and the page
         is just a straight translate3d — skip all the heavy WebGL projection,
         matrix-math and filter work that otherwise drives scroll jank. */
      if (!isInside && renderer && dims.ready) {
        const m = portalScreen.model()
        const restYaw = m.yawDeg * DEG
        const targetYaw = -90 * DEG // front face of monitor & keyboard faces forward (+Z)

        // dolly camera z
        camera.position.z = CAM_REST_Z - eEnter * (CAM_REST_Z - zInside)

        // slide pivot from rest pose to center aligned with the CRT screen
        const targetY = -(dims.glassY * worldScale)
        pivot.position.x = restX * (1 - eEnter)
        pivot.position.y = restY * (1 - eEnter) + targetY * eEnter

        if (eEnter < 1) {
          const idle = m.sway && !REDUCED
          const swayFactor = 1 - eEnter
          const currentYaw = THREE.MathUtils.lerp(restYaw, targetYaw, eEnter)
          const idleYaw = idle ? Math.sin(performance.now() / 5000) * 0.08 * swayFactor : 0
          const gyroYaw = idle ? gyro.sample().sway * 0.3 * swayFactor : 0
          spinner.rotation.y = currentYaw + idleYaw + gyroYaw

          const gyroTilt = gyro.sample().tilt * 0.35 * swayFactor
          spinner.rotation.x = THREE.MathUtils.lerp(-0.04, 0, eEnter) + gyroTilt
        } else {
          spinner.rotation.y = targetYaw
          spinner.rotation.x = 0
        }
      }

      const W = canvasHost.clientWidth
      const H = canvasHost.clientHeight

      if (!isInside && renderer && dims.ready && dims.glass.length === 4 && W > 0 && H > 0) {
        /* project() reads camera.matrixWorldInverse, which the renderer only
           refreshes during render() — without this the very first frame (before
           anything has been drawn) lays the page onto a garbage quad */
        camera.updateMatrixWorld(true)
        pivot.updateMatrixWorld(true)

        const corners = glassCorners(W / H)
        for (let i = 0; i < 4; i++) {
          const [lx, ly, lz] = corners[i]
          quadV[i].set(lx, ly, lz)
          modelBox.localToWorld(quadV[i])
          quadV[i].project(camera)
          quadPx[i].x = ((quadV[i].x + 1) / 2) * W
          quadPx[i].y = ((1 - quadV[i].y) / 2) * H
        }

        /* The page stays welded to the glass for almost the whole dolly, so the
           only thing that grows it is the camera moving in — the screen can't
           open ahead of the zoom. Only in the last stretch does it settle onto
           the exact viewport rectangle, which the camera has nearly reached
           anyway, so the hand-off is a few pixels rather than a jump. */
        const t = ramp(eEnterRaw, 0.72, 1)
        const full = [
          { x: 0, y: H },
          { x: W, y: H },
          { x: W, y: 0 },
          { x: 0, y: 0 },
        ]
        const dst = quadPx.map((q, i) => ({
          x: THREE.MathUtils.lerp(q.x, full[i].x, t),
          y: THREE.MathUtils.lerp(q.y, full[i].y, t),
        }))
        /* the matrix helper maps the src box corners in tl, tr, br, bl order */
        world.style.transform = quadToMatrix3d(W, H, [dst[3], dst[2], dst[1], dst[0]])
        world.style.opacity = '1'
        world.style.borderRadius = `${THREE.MathUtils.lerp(10, 0, t)}px`
        world.style.pointerEvents = isInside ? 'auto' : 'none'

        /* --- make it read as light coming *out of* the tube, not a sticker ---
           `glass` is 1 while the page sits on the screen and 0 once it has
           taken over the viewport, so none of this survives into the real page.
           It washes out a little earlier than the geometry settles, so the tube
           has already stopped being a tube by the time the page takes over. */
        const glass = 1 - ramp(eEnterRaw, 0.5, 0.96)

        /* soft edges, so the picture dissolves into the glass instead of
           ending on a printed-looking hard cut */
        const soft = Math.round(45 * glass) / 10
        if (soft !== lastSoft) {
          lastSoft = soft
          if (soft > 0.05) {
            const band = `transparent 0%, #000 ${soft}%, #000 ${100 - soft}%, transparent 100%`
            const mask = `linear-gradient(to right, ${band}), linear-gradient(to bottom, ${band})`
            world.style.setProperty('mask-image', mask)
            world.style.setProperty('-webkit-mask-image', mask)
            world.style.setProperty('mask-composite', 'intersect')
            world.style.setProperty('-webkit-mask-composite', 'source-in')
          } else {
            world.style.removeProperty('mask-image')
            world.style.removeProperty('-webkit-mask-image')
          }
        }

        /* phosphor look: a touch of bloom, slightly washed colour and just
           enough softness that the pixels belong to the tube */
        world.style.filter =
          glass > 0.002
            ? `blur(${(0.5 * glass).toFixed(2)}px) saturate(${(1 - 0.3 * glass).toFixed(3)}) contrast(${(1 + 0.14 * glass).toFixed(3)}) brightness(${(1 + 0.05 * glass).toFixed(3)})`
            : 'none'

        if (glassFx) {
          glassFx.style.opacity = String(glass)
          glassFx.style.visibility = glass > 0.002 ? 'visible' : 'hidden'
          /* how many screen pixels one element pixel covers right now */
          const k = Math.max(
            0.02,
            Math.hypot(dst[1].x - dst[0].x, dst[1].y - dst[0].y) / Math.max(1, W),
          )
          const px = (onScreen: number) => `${(onScreen / k).toFixed(2)}px`
          glassFx.style.setProperty('--crt-scan', px(4))
          glassFx.style.setProperty('--crt-bleed', px(9))
          glassFx.style.setProperty('--crt-bleed-x', px(3))
        }
      }

      /* 4. Scrub through inner sections once inside */
      if (isInside) {
        const scrollInside = Math.min(L.travelMax, Math.max(0, y - enterPx))
        inner.style.transform = `translate3d(0, ${-scrollInside}px, 0)`
        /* interactive page once fully inside; the 3D work above is skipped then */
        world.style.pointerEvents = 'auto'
      } else {
        inner.style.transform = 'translate3d(0, 0, 0)'
        if (world) world.style.pointerEvents = 'none'
      }

      /* Helper hint chips */
      if (hintRef.current) {
        hintRef.current.style.opacity = String(eEnterRaw < 0.25 ? 1 - eEnterRaw * 4 : 0)
      }
      if (insideChipRef.current) {
        insideChipRef.current.style.opacity = String(isInside ? 1 : 0)
        const id = currentIdAt(y / Math.max(1, L.range))
        if (insideChipRef.current.dataset.id !== id && id !== 'home') {
          insideChipRef.current.dataset.id = id
          insideChipRef.current.textContent = `inside the computer · ${id}`
        }
      }
    }

    /* Coalesce scroll events to once per animation frame. The 3D portal does
       heavy work (projection, matrix math, CSS transforms/filters) that must
       never run more than once per frame — otherwise scrolling janks. */
    let scrollRaf = 0
    const onScroll = () => {
      if (scrollRaf) return
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0
        apply(window.scrollY)
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', frameMachine)

    measure()
    apply(window.scrollY)

    let raf = 0
    let lastRev = -1
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const rev = portalScreen.modelRevision()
      if (rev !== lastRev) {
        lastRev = rev
        frameMachine()
      }
      /* Skip the actual GPU render when the effect can't be seen: hidden tab,
         reduced-motion, or fully entered the screen (the 3D is then covered by
         the opaque inner page). Keeps phones cool and smooth. */
      const visible =
        !document.hidden && !REDUCED && !insideNow
      if (renderer && dims.ready && visible) {
        renderer.render(scene, camera)
      }
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      destroyRouter()
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', frameMachine)
      gyro.dispose()
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose()
          const mat = obj.material as THREE.Material | THREE.Material[]
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
          else mat.dispose()
        }
      })
      if (renderer) {
        renderer.dispose()
        renderer.domElement.remove()
      }
    }
  }, [])

  return (
    <div ref={rootRef} className="fixed inset-0 z-[30] overflow-hidden">
      {/* 3D machine */}
      <div ref={canvasHostRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Hero stage: floats over 3D room, fades smoothly on scroll */}
      {hero && (
        <div
          ref={heroHostRef}
          className="absolute inset-0 z-20 flex flex-col justify-start pt-20 sm:justify-center sm:pt-0 will-change-[transform,opacity]"
        >
          {hero}
        </div>
      )}

      {/* the "screen": the rest of the site, revealed smoothly on screen entrance */}
      <div
        ref={worldRef}
        className="pointer-events-none absolute inset-0 z-30 overflow-hidden opacity-0 will-change-[transform,opacity]"
        style={{ transformOrigin: '0 0', backfaceVisibility: 'hidden' }}
      >
        <div
          ref={innerRef}
          className="relative w-full min-h-full will-change-transform select-text"
          style={{ backgroundColor: 'var(--color-paper)' }}
        >
          {/* animated background FX + constellation and particles across all sections */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
            <BackgroundFX />
          </div>

          {/* tactile dot-grid pattern (identical to header / App.tsx) */}
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-80"
            aria-hidden="true"
            style={{
              backgroundImage:
                'radial-gradient(circle, color-mix(in srgb, var(--color-ink) 28%, transparent) 1.2px, transparent 1.6px), ' +
                'linear-gradient(to right, color-mix(in srgb, var(--color-ink) 6%, transparent) 1px, transparent 1px), ' +
                'linear-gradient(to bottom, color-mix(in srgb, var(--color-ink) 6%, transparent) 1px, transparent 1px)',
              backgroundSize: '28px 28px, 112px 112px, 112px 112px',
            }}
          />

          {/* tactile paper grain texture overlay */}
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]"
            aria-hidden="true"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27120%27 height=%27120%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%273%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")',
            }}
          />
          <div className="relative z-10 w-full">
            {children}
          </div>
        </div>

        {/* CRT glass treatment: scanlines, tube curvature and a sheen on the
            front glass. Sits above the page and is faded out by the scroll, so
            once you are inside the screen the page is untouched. */}
        <div
          ref={glassFxRef}
          className="pointer-events-none absolute inset-0 z-50"
          aria-hidden="true"
        >
          {/* Phosphor scanlines. The period is set from JS in `--crt-scan`,
              because this layer is drawn at full viewport size and then shrunk
              onto the glass — a fixed 1px line would alias into static. */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(to bottom, rgba(10,10,14,0.17) 0 38%, rgba(255,255,255,0.04) 38% 100%)',
              backgroundSize: '100% var(--crt-scan, 3px)',
            }}
          />
          {/* tube curvature: darkens towards the corners */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(128% 128% at 50% 48%, rgba(0,0,0,0) 46%, rgba(6,6,10,0.22) 76%, rgba(4,4,8,0.52) 100%)',
            }}
          />
          {/* light bleeding off the phosphor into the bezel */}
          <div
            className="absolute inset-0"
            style={{ boxShadow: 'inset 0 0 var(--crt-bleed, 18px) var(--crt-bleed-x, 7px) rgba(6,6,10,0.5)' }}
          />
          {/* sheen on the front glass */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(118deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0.015) 28%, transparent 44%)',
            }}
          />
        </div>
      </div>

      {/* hint chips (hidden on phones) */}
      <div
        ref={hintRef}
        className="pointer-events-none absolute bottom-8 left-1/2 z-50 hidden sm:block -translate-x-1/2 text-center transition-opacity duration-300"
      >
        <span className="rounded-full border border-line bg-paper/85 px-4 py-2 font-hand text-lg text-ink-soft shadow-sm backdrop-blur-sm">
          scroll — enter the computer screen ▸
        </span>
      </div>
      <div className="pointer-events-none absolute left-5 top-20 z-50 sm:left-6">
        <span
          ref={insideChipRef}
          className="rounded-full border border-line bg-paper/85 px-4 py-2 font-hand text-base text-ink-soft opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-300"
          data-id=""
        />
      </div>
    </div>
  )
}