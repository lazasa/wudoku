import { CLIENT_MESSAGES } from '../const/index.mjs'
import { Board } from '../sudoku/board.mjs'
import { workerPool } from '../workers/workers.mjs'

export async function getUnsolvedBoard(req, res) {
  const task = { type: CLIENT_MESSAGES.GENERATE_SUDOKU }
  try {
    const result = await workerPool.execute(task)
    const { board, steps } = result
    res.json({ board, steps })
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end(`Error generating Sudoku: ${error.message}`)
  }
}

export async function getSolvedBoard(req, res) {
  let body = ''
  req.on('data', chunk => {
    body += chunk.toString()
  })
  req.on('end', async () => {
    const { grid } = JSON.parse(body)
    const task = {
      type: CLIENT_MESSAGES.SOLVE_SUDOKU,
      payload: { grid }
    }
    try {
      const result = await workerPool.execute(task)
      const { board: solvedBoard, steps } = result
      res.json({ board: solvedBoard, steps })
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end(`Error solving Sudoku: ${error.message}`)
    }
  })
}
