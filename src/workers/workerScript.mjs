import { parentPort } from 'worker_threads'
import { CLIENT_MESSAGES } from '../const/index.mjs'
import { solveSudoku } from '../sudoku/solver.mjs'
import { getUnsolvedBoard } from '../sudoku/generator.mjs'
import { Board } from '../sudoku/board.mjs'

parentPort.on('message', message => {
  const { id, type, payload } = message

  if (type === CLIENT_MESSAGES.SOLVE_SUDOKU) {
    if (!payload || !payload.grid) {
      parentPort.postMessage({
        id,
        error: 'No board provided'
      })
      return
    }
    const { grid } = payload
    const board = Board.fromArray(grid)
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
