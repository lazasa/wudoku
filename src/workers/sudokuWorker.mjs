import { parentPort } from 'worker_threads'
import { WORKER_MESSAGES } from '../const/index.mjs'

parentPort.postMessage('Sudoku worker is online')

parentPort.on('message', message => {
  console.log('Message from main thread:', message)
})
