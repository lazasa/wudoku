import { Worker } from 'worker_threads'

let sudokuWorker = null

const initializeWorkers = () => {
  sudokuWorker = new Worker('./src/workers/sudokuWorker.mjs', {
    type: 'module'
  })
}

export { sudokuWorker, initializeWorkers }
