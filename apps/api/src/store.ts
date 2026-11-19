import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { applyCommand, emptyScene, snapshotSchema } from '@garden/scene'
import type { EditRequest, Snapshot } from '@garden/scene'

export class EditError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// HTTP and MCP share this single writer. A reader sees either complete file.
export function createStore(file: string) {
  let tail = Promise.resolve()
  async function read(): Promise<Snapshot> {
    let raw: string
    try {
      raw = await readFile(file, 'utf8')
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT')
        return { revision: 0, scene: emptyScene() }
      throw err
    }
    return snapshotSchema.parse(JSON.parse(raw))
  }

  async function save(edit: EditRequest) {
    const current = await read()
    if (current.revision !== edit.baseRevision)
      throw new EditError(409, 'Scene changed. Reload the current version.')
    let scene
    try {
      scene = applyCommand(current.scene, edit.command)
    } catch (err) {
      throw new EditError(422, (err as Error).message)
    }
    const snapshot = { revision: current.revision + 1, scene }
    await mkdir(dirname(file), { recursive: true })
    const temp = file + '.' + randomUUID() + '.tmp'
    try {
      await writeFile(temp, JSON.stringify(snapshot, null, 2) + '\n', { flag: 'wx', flush: true })
      await rename(temp, file)
    } finally {
      await rm(temp, { force: true })
    }
    return snapshot
  }

  return {
    read,
    edit(request: EditRequest) {
      const result = tail.then(() => save(request))
      tail = result.then(
        () => {},
        () => {},
      )
      return result
    },
  }
}
