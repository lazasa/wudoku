// sudoku rules
// Each row must contain all digits from 1 to 9: No number can be repeated within a single row.
// Each column must contain all digits from 1 to 9: No number can be repeated within a single column.
// Each of the nine 3x3 subgrids must contain all digits from 1 to 9: No number can be repeated within a single 3x3 subgrid.

function isValid(board, row, col, num) {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) {
      return false
    }
  }

  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) {
      return false
    }
  }

  const startRow = row - (row % 3)
  const startCol = col - (col % 3)
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) {
        return false
      }
    }
  }

  return true
}

function solveSudoku(board, rowPos, colPos) {
  if (rowPos === 8 && colPos === 9) return true

  if (colPos === 9) {
    rowPos++
    colPos = 0
  }

  if (board[rowPos][colPos] !== 0) return solveSudoku(board, rowPos, colPos + 1)

  for (let tryNumber = 1; tryNumber <= 9; tryNumber++) {
    if (isValid(board, rowPos, colPos, tryNumber)) {
      board[rowPos][colPos] = tryNumber
      if (solveSudoku(board, rowPos, colPos + 1)) return true
      board[rowPos][colPos] = 0
    }
  }

  return false
}

function printBoard(board) {
  for (let r = 0; r < 9; r++) {
    let row = ''
    for (let d = 0; d < 9; d++) {
      row += board[r][d] + ' '
    }
    console.log(row)
  }
}

export { solveSudoku, printBoard }
