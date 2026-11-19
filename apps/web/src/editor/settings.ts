// Editing distances are in scene metres and camera angles are in radians.
export const editing = {
  snapStep: 0.25,
  dragThresholdPx: 4,
  placementColumns: 4,
  placementSpacing: 2.25,
  angleDecimals: 6,
} as const

export const cameraControls = {
  buttonZoom: 1.2,
  wheelZoom: 0.1,
  orbitHorizontal: 0.008,
  orbitVertical: 0.006,
} as const
