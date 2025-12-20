import { parentPort } from 'worker_threads'
import { CLIENT_MESSAGES } from '../const/index.mjs'
import { solveSudoku } from '../sudoku/solver.mjs'
import { getUnsolvedBoard } from '../sudoku/generator.mjs'

parentPort.on('message', message => {
  const { id, type, payload } = message

  if (type === CLIENT_MESSAGES.SOLVE_SUDOKU) {
    if (!payload || !payload.board) {
      parentPort.postMessage({
        id,
        error: 'No board provided'
      })
      return
    }
    const { board } = payload
    const stepStore = []
    solveSudoku(board, stepStore)
    parentPort.postMessage({
      id,
      result: { board, steps: stepStore }
    })
  }

  if (type === CLIENT_MESSAGES.GENERATE_SUDOKU) {
    const { board, steps } = getUnsolvedBoard()

    parentPort.postMessage({
      id,
      result: { board, steps }
    })
  }
})
