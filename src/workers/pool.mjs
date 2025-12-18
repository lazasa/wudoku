import { Worker } from 'node:worker_threads'
import os from 'node:os'
import crypto from 'node:crypto'

class WorkerPool {
  constructor(config) {
    this.validateConfig(config)
    this.config = {
      size: config.size || os.cpus().length - 1,
      workerScript: config.workerScript
    }

    this.pending = new Map()
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
    const worker = this.#getNextWorker()

    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID()
      this.pending.set(id, { resolve, reject })

      worker.postMessage({ id, task })
    })
  }

  #getNextWorker() {
    const worker = this.workers[this.currentIndex]
    this.currentIndex = (this.currentIndex + 1) % this.workers.length
    return worker
  }

  #handleWorkerMessage(worker, message) {
    const { id, result, error } = message
    const pendingTask = this.pending.get(id)

    if (!pendingTask) {
      return
    }

    if (error) {
      pendingTask.reject(new Error(error))
    } else {
      pendingTask.resolve(result)
    }

    this.pending.delete(id)
  }

  #handleWorkerError(worker, error) {
    console.error('Worker error:', error)
  }

  #initialize() {
    for (let i = 0; i < this.config.size; i++) {
      const newWorker = new Worker(this.config.workerScript)
      newWorker.on('message', message =>
        this.#handleWorkerMessage(newWorker, message)
      )
      newWorker.on('error', error => this.#handleWorkerError(newWorker, error))
      this.workers.push(newWorker)
    }
  }

  close() {
    for (const worker of this.workers) {
      worker.terminate()
    }
  }
}
