import { Worker } from 'node:worker_threads'
import os from 'node:os'

class WorkerPool {
  constructor(config) {
    this.validateConfig(config)
    this.config = {
      size: config.size || os.cpus().length - 1,
      workerScript: config.workerScript
    }

    this.workers = []
    this.currentIndex = 0

    this.#initialize()
  }

  validateConfig(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('Configuration object is required')
    }

    const { size } = config

    if (size !== undefined && (size < 1 || !Number.isInteger(size))) {
      throw new Error('Invalid pool size')
    }
  }

  execute(task) {
    // round robin worker selection
    const worker = this.workers[this.currentIndex]
    this.currentIndex = (this.currentIndex + 1) % this.workers.length

    return new Promise((resolve, reject) => {
      const onMessage = result => {
        worker.off('error', onError)
        resolve(result)
      }

      const onError = error => {
        worker.off('message', onMessage)
        reject(error)
      }

      worker.once('message', onMessage)
      worker.once('error', onError)

      worker.postMessage(task)
    })
  }

  #initialize() {
    for (let i = 0; i < this.config.size; i++) {
      const newWorker = new Worker(this.config.workerScript)
      this.workers.push(newWorker)
    }
  }

  close() {
    for (const worker of this.workers) {
      worker.terminate()
    }
  }
}
