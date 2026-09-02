/* Tuning for the 3D computer in the hero portal.
   Editable from the editor's "3D" tab — saved with the rest of the draft. */

export interface Model3DSettings {
  scale: number // rest size as a fraction of viewport height
  posX: number // -1 … 1 → left edge … right edge at rest
  posY: number // -1 … 1 → bottom … top at rest
  yawDeg: number // corrective rotation so the screen faces the camera
  sway: boolean // gentle idle rotation while it waits
  enterVh: number // how many viewport-heights the dolly-in takes
}

export const DEFAULT_MODEL3D: Model3DSettings = {
  scale: 0.55,
  posX: 0.52,
  posY: 0.0,
  yawDeg: -75,
  sway: true,
  enterVh: 1.2,
}