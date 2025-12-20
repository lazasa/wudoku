import { Worker } from 'node:worker_threads'
import os from 'node:os'
import crypto from 'node:crypto'
import { CLIENT_MESSAGES } from '../const/index.mjs'

export class WorkerPool {
  constructor(config) {
    this.validateConfig(config)
    this.config = {
      size: config.size || os.cpus().length - 1,
      workerScript: config.workerScript
    }

    this.pending = new Map() // tasks being processed
    this.workers = [] // all workers in the pool
    this.currentIndex = 0 // for round robin selection

    this.#initialize() // create workers
  }

  validateConfig(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('Configuration object is required')
    }

    if (!config.workerScript) {
      throw new Error('workerScript is required in configuration')
    }
  }

  #validateTask(task) {
    if (!task || typeof task !== 'object') {
      throw new Error('Task must be an object')
    }

    if (typeof task.type !== 'string' || task.type.trim() === '') {
      throw new Error('Task type must be a non-empty string')
    }

    if (!(task.type in CLIENT_MESSAGES)) {
      throw new Error(`Unsupported task type: ${task.type}`)
    }
  }

  execute(task) {
    this.#validateTask(task)
    // round robin worker selection
    const worker = this.#getNextWorker()
    const { type, payload } = task

    //returns a promise that resolves when the worker completes the task
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID()
      this.pending.set(id, { resolve, reject })

      worker.postMessage({ id, type, payload }) // send task to worker
    })
  }

  #getNextWorker() {
    const worker = this.workers[this.currentIndex]
    this.currentIndex = (this.currentIndex + 1) % this.workers.length
    return worker
  }

  #handleWorkerMessage(message) {
    // message contains id, result, and error (if any)
    const { id, result, error } = message
    const pendingTask = this.pending.get(id)

    if (!pendingTask) return // in case already resolved
    this.pending.delete(id)

    if (error) {
      pendingTask.reject(new Error(error))
    } else {
      pendingTask.resolve(result)
    }
  }

  #handleWorkerError(error) {
    console.error('Worker error:', error)
  }

  #initialize() {
    for (let i = 0; i < this.config.size; i++) {
      const newWorker = new Worker(this.config.workerScript)
      newWorker.on('message', message => this.#handleWorkerMessage(message))
      newWorker.on('error', error => this.#handleWorkerError(error))
      this.workers.push(newWorker)
    }
  }

  close() {
    for (const worker of this.workers) {
      worker.terminate()
    }
  }
}
