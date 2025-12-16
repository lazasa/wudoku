import { Worker } from 'node:worker_threads'
import EventEmitter from 'node:events'
import os from 'node:os'

class WorkerPool {
  constructor(config) {
    this.validateConfig(config)

    this.config = {
      size: config.size || os.cpus().length - 1,
      workerScript: config.workerScript
    }

    this.workers = []
    this.pending = new Map()

    this.initialize()
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
    const requestId = crypto.randomUUID()

    return new Promise((resolve, reject) => {
      const availableWorker = this.workers.find(
        worker => !this.pending.has(worker)
      )

      if (!availableWorker) {
        return reject(new Error('No available workers'))
      }

      this.pending.set(availableWorker, { resolve, reject })
    })
  }

  initialize() {
    for (let i = 0; i < this.config.size; i++) {
      const newWorker = new Worker(this.config.workerScript)
      this.workers.push(newWorker)
    }
  }
}

class Threads extends EventEmitter {
  constructor(config) {
    super()
    this.validateConfig(config)

    this.config = {
      size: config.size || os.cpus().length,
      workerScript: config.workerScript,
      maxQueueSize: config.maxQueueSize || 1000,
      taskTimeout: config.taskTimeout || 30000,
      maxRetries: config.maxRetries || 3,
      monitorInterval: config.monitorInterval || 5000
    }

    this.workers = []
    this.taskQueue = []
    this.activeWorkers = new Map()
    this.workerMetrics = new Map()
    this.accepting = true

    this.initialize()
  }

  validateConfig(config) {
    if (!config.workerScript) {
      throw new Error('Worker script path is required')
    }
    if (
      config.size !== undefined &&
      (config.size < 1 || !Number.isInteger(config.size))
    ) {
      throw new Error('Invalid pool size')
    }
  }

  initialize() {
    for (let i = 0; i < this.config.size; i++) {
      this.createWorker()
    }
    this.monitorInterval = setInterval(
      () => this.monitorPoolHealth(),
      this.config.monitorInterval
    )
  }

  createWorker() {
    const worker = new Worker(this.config.workerScript)

    this.workerMetrics.set(worker, {
      tasksCompleted: 0,
      errors: 0,
      avgProcessingTime: 0,
      lastActive: Date.now()
    })

    worker.on('message', result => {
      this.handleTaskCompletion(worker, result)
    })

    worker.on('error', error => {
      this.handleWorkerError(worker, error)
    })

    worker.on('exit', code => {
      if (code !== 0) {
        this.handleWorkerExit(worker)
      }
    })

    this.workers.push(worker)
    return worker
  }

  async submitTask(task) {
    if (!this.accepting) {
      throw new Error('Thread pool is shutting down')
    }

    return new Promise((resolve, reject) => {
      const taskWrapper = {
        id: Date.now() + Math.random(),
        task,
        resolve,
        reject,
        timestamp: Date.now(),
        retriesLeft: this.config.maxRetries
      }

      const availableWorker = this.getAvailableWorker()
      if (availableWorker) {
        this.assignTask(availableWorker, taskWrapper)
      } else {
        this.taskQueue.push(taskWrapper)
        if (this.taskQueue.length > this.config.maxQueueSize) {
          this.emit('queue-full', this.taskQueue.length)
        }
      }
    })
  }

  getAvailableWorker() {
    return this.workers.find(worker => !this.activeWorkers.has(worker))
  }

  assignTask(worker, taskWrapper) {
    const { id, task } = taskWrapper
    this.activeWorkers.set(worker, taskWrapper)

    const timeoutId = setTimeout(() => {
      if (this.activeWorkers.has(worker)) {
        const taskWrapper = this.activeWorkers.get(worker)
        if (taskWrapper) {
          taskWrapper.reject(new Error('Task timeout'))
          this.activeWorkers.delete(worker)
          this.processNextTask()
        }
      }
    }, this.config.taskTimeout)

    taskWrapper.timeoutId = timeoutId

    try {
      worker.postMessage({ id, task })
    } catch (error) {
      clearTimeout(timeoutId)
      this.activeWorkers.delete(worker)
      taskWrapper.reject(error)
      this.processNextTask()
    }
  }

  handleTaskCompletion(worker, { id, result, error }) {
    const taskWrapper = this.activeWorkers.get(worker)
    if (!taskWrapper) {
      // Worker completed a task but is no longer active
      // This is not an error condition, just ignore the result
      return
    }

    clearTimeout(taskWrapper.timeoutId)
    this.updateWorkerMetrics(worker, error ? 'error' : 'success')

    this.activeWorkers.delete(worker)

    if (error) {
      if (taskWrapper.retriesLeft > 0) {
        taskWrapper.retriesLeft--
        this.taskQueue.unshift(taskWrapper)
      } else {
        taskWrapper.reject(new Error(error))
      }
    } else {
      taskWrapper.resolve(result)
    }

    this.processNextTask()
  }

  handleWorkerError(worker, error) {
    const metrics = this.workerMetrics.get(worker)
    if (metrics) {
      metrics.errors++
    }

    const taskWrapper = this.activeWorkers.get(worker)
    if (taskWrapper) {
      clearTimeout(taskWrapper.timeoutId)

      if (taskWrapper.retriesLeft > 0) {
        taskWrapper.retriesLeft--
        this.taskQueue.unshift(taskWrapper)
      } else {
        taskWrapper.reject(error)
      }

      this.activeWorkers.delete(worker)
    }

    this.replaceWorker(worker)
    this.processNextTask()
  }

  handleWorkerExit(worker) {
    const index = this.workers.indexOf(worker)
    if (index !== -1) {
      this.workers.splice(index, 1)
      this.workerMetrics.delete(worker)

      if (this.accepting) {
        const newWorker = this.createWorker()
        this.workers.splice(index, 0, newWorker)
      }
    }
  }

  replaceWorker(worker) {
    const index = this.workers.indexOf(worker)
    if (index !== -1) {
      this.workers.splice(index, 1)
      this.workerMetrics.delete(worker)
      worker.terminate().catch(() => {})

      if (this.accepting) {
        const newWorker = this.createWorker()
        this.workers.splice(index, 0, newWorker)
      }
    }
  }

  processNextTask() {
    if (this.taskQueue.length === 0) return

    const availableWorker = this.getAvailableWorker()
    if (availableWorker) {
      const nextTask = this.taskQueue.shift()
      this.assignTask(availableWorker, nextTask)
    }
  }

  updateWorkerMetrics(worker, status) {
    const metrics = this.workerMetrics.get(worker)
    if (!metrics) return

    if (status === 'success') {
      metrics.tasksCompleted++
    } else if (status === 'error') {
      metrics.errors++
    }
    metrics.lastActive = Date.now()
  }

  monitorPoolHealth() {
    const metrics = {
      activeWorkers: this.activeWorkers.size,
      queueLength: this.taskQueue.length,
      workerMetrics: Array.from(this.workerMetrics.entries()).map(
        ([worker, metrics]) => ({
          workerId: this.workers.indexOf(worker),
          ...metrics
        })
      )
    }
    this.emit('metrics', metrics)
  }

  async shutdown() {
    this.accepting = false

    // Wait for active tasks to complete
    const activePromises = Array.from(this.activeWorkers.values()).map(
      task =>
        new Promise(resolve => {
          const originalResolve = task.resolve
          task.resolve = result => {
            originalResolve(result)
            resolve()
          }
        })
    )

    await Promise.all(activePromises)

    // Clean up intervals and workers
    clearInterval(this.monitorInterval)

    await Promise.all(
      this.workers.map(worker => {
        try {
          return worker.terminate()
        } catch (error) {
          return Promise.resolve()
        }
      })
    )

    this.workers = []
    this.workerMetrics.clear()
    this.activeWorkers.clear()
    this.taskQueue = []
  }
}

export { WorkerPool }
