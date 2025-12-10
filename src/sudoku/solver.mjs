// sudoku rules
// Each row must contain all digits from 1 to 9: No number can be repeated within a single row.
// Each column must contain all digits from 1 to 9: No number can be repeated within a single column.
// Each of the nine 3x3 subgrids must contain all digits from 1 to 9: No number can be repeated within a single 3x3 subgrid.

function solveSudoku(board, stepStore, rowPos = 0, colPos = 0) {
  if (rowPos === 8 && colPos === 9) return true

  if (colPos === 9) {
    rowPos++
    colPos = 0
  }

  if (board.getCell(rowPos, colPos) !== 0)
    return solveSudoku(board, stepStore, rowPos, colPos + 1)

  for (let tryNumber = 1; tryNumber <= 9; tryNumber++) {
    if (board.isMoveValid(rowPos, colPos, tryNumber)) {
      board.setCell(rowPos, colPos, tryNumber)
      stepStore.push({ row: rowPos, col: colPos, value: tryNumber })
      if (solveSudoku(board, stepStore, rowPos, colPos + 1)) return true
      stepStore.pop()
      board.setCell(rowPos, colPos, 0)
    }
  }

  return false
}

export { solveSudoku }
