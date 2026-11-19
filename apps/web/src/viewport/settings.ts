export type ViewportPalette = {
  ground: string
  grid: string
  object: string
  selected: string
}

export const cameraSettings = {
  fov: 40,
  near: 0.05,
  far: 400,
  home: { yaw: 0.65, tilt: 0.82, radius: 14 },
  minTilt: 0.12,
  maxTilt: 1.35,
  minRadius: 2,
  maxRadius: 90,
} as const

export const rendering = {
  pixelRatioLimit: 1.5,
  fogDensity: 0.025,
  grid: { extent: 120, cellSize: 1, texturePixels: 64, linePixels: 2 },
  polygon: { radius: 1, thickness: 0.12, groundOffset: 0.005 },
} as const
