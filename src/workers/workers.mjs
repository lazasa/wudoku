import { WorkerPool } from './pool.mjs'

const workerPool = new WorkerPool({
  workerScript: new URL('./workerScript.mjs', import.meta.url)
})

export { workerPool }
