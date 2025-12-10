import { Board } from './board.mjs'
import { BOARD_SIZE } from '../const/index.mjs'

const MIN_HINTS = 17

function shuffledDigits(size) {
  const nums = Array.from({ length: size }, (_, i) => i + 1)
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[nums[i], nums[j]] = [nums[j], nums[i]]
  }
  return nums
}

function randomizeSudoku(board, steps, rowPos = 0, colPos = 0) {
  if (rowPos === 8 && colPos === 9) return true

  if (colPos === board.size) {
    rowPos++
    colPos = 0
  }

  if (board.getCell(rowPos, colPos) !== 0)
    return randomizeSudoku(board, steps, rowPos, colPos + 1)

  const digits = shuffledDigits(board.size)
  for (const tryNumber of digits) {
    if (board.isMoveValid(rowPos, colPos, tryNumber)) {
      board.setCell(rowPos, colPos, tryNumber)
      steps.set(`${rowPos},${colPos}`, tryNumber)
      if (randomizeSudoku(board, steps, rowPos, colPos + 1)) return true
      steps.delete(`${rowPos},${colPos}`)
      board.setCell(rowPos, colPos, 0)
    }
  }

  return false
}

function unsolveSudoku(board, nhints, steps) {
  let hintsToRemove = 81 - nhints
  while (hintsToRemove > 0) {
    const row = Math.floor(Math.random() * 9)
    const col = Math.floor(Math.random() * 9)

    if (board.getCell(row, col) !== 0) {
      steps.set(`${row},${col}`, 0)
      board.setCell(row, col, 0)
      hintsToRemove--
    }
  }
}

function getUnsolvedBoard(nhints = MIN_HINTS) {
  const board = new Board(BOARD_SIZE.MEDIUM)
  let steps = new Map()
  randomizeSudoku(board, steps)
  unsolveSudoku(board, nhints, steps)

  const parsedSteps = []
  for (const [key, value] of steps.entries()) {
    const [row, col] = key.split(',').map(Number)
    parsedSteps.push({ row, col, value })
  }

  return { board, steps: parsedSteps }
}

export { getUnsolvedBoard }
