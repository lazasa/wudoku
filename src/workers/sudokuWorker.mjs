import { parentPort } from 'worker_threads'

parentPort.postMessage('Sudoku worker is online')

parentPort.on('message', message => {
  console.log('Message from main thread:', message)
})
