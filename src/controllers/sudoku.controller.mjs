import { WORKER_MESSAGES, CLIENT_MESSAGES } from '../const/index.mjs'
import { sudokuWorker } from '../workers/workers.mjs'

export async function getUnsolvedBoard(req, res) {
  sudokuWorker.postMessage({ type: CLIENT_MESSAGES.GENERATE_SUDOKU })

  sudokuWorker.once('message', message => {
    const { type, payload, error } = message

    if (type === WORKER_MESSAGES.SUDOKU_GENERATED) {
      const { board, steps } = payload
      res.json({ board, steps })
    } else if (type === WORKER_MESSAGES.ERROR) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end(`Error generating Sudoku: ${error}`)
    }
  })
}

export async function getSolvedBoard(req, res) {
  let body = ''
  req.on('data', chunk => {
    body += chunk.toString()
  })
  req.on('end', () => {
    const { board } = JSON.parse(body)
    sudokuWorker.postMessage({
      type: CLIENT_MESSAGES.SOLVE_SUDOKU,
      payload: { board }
    })

    sudokuWorker.once('message', message => {
      const { type, payload, error } = message

      if (type === WORKER_MESSAGES.SUDOKU_SOLVED) {
        const { board, steps } = payload
        res.json({ board, steps })
      } else if (type === WORKER_MESSAGES.ERROR) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end(`Error solving Sudoku: ${error}`)
      }
    })
  })
}
