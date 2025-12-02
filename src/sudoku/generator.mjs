import { isValid } from './solver.mjs'

const MIN_HINTS = 17

function generateEmptyBoard() {
  const board = []
  for (let i = 0; i < 9; i++) {
    const row = new Array(9).fill(0)

    board.push(row)
  }
  return board
}

function shuffledDigits() {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[nums[i], nums[j]] = [nums[j], nums[i]]
  }
  return nums
}

function randomizeSudoku(board, rowPos = 0, colPos = 0) {
  if (rowPos === 8 && colPos === 9) return true

  if (colPos === 9) {
    rowPos++
    colPos = 0
  }

  if (board[rowPos][colPos] !== 0)
    return randomizeSudoku(board, rowPos, colPos + 1)

  const digits = shuffledDigits()
  for (const tryNumber of digits) {
    if (isValid(board, rowPos, colPos, tryNumber)) {
      board[rowPos][colPos] = tryNumber
      if (randomizeSudoku(board, rowPos, colPos + 1)) return true
      board[rowPos][colPos] = 0
    }
  }

  return false
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
  randomizeSudoku(board)
  unsolveSudoku(board, nhints)
  return board
}

export { getUnsolvedBoard }
