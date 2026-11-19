// Shared by Node entry points and Vite's development proxy.
export const localHost = '127.0.0.1'
export const defaultWebPort = 5173
export function localService(port = Number(process.env.SCENE_API_PORT ?? 4174)) {
  return { host: localHost, port, origin: 'http://' + localHost + ':' + port }
}
