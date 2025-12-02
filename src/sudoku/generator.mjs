import { solveSudoku } from './solver.mjs'
// Generate a random 9x9 solvable sudoku board

const MIN_HINTS = 17

function generateEmptyBoard() {
  const board = []
  for (let i = 0; i < 9; i++) {
    const row = new Array(9).fill(0)

    board.push(row)
  }
  return board
}

function unsolveSudoku(board, nhints) {
  let hintsToRemove = 81 - nhints
  while (hintsToRemove > 0) {
    const row = Math.floor(Math.random() * 9)
    const col = Math.floor(Math.random() * 9)

    if (board[row][col] !== 0) {
      board[row][col] = 0
      hintsToRemove--
    }
  }
}

function getUnsolvedBoard(nhints = MIN_HINTS) {
  const board = generateEmptyBoard()
  solveSudoku(board, 0, 0)
  unsolveSudoku(board, nhints)
  return board
}

export { getUnsolvedBoard }
