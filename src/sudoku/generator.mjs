// Generate a random 9x9 solvable sudoku board

const MIN_HINTS = 18

function generateEmptyBoard() {
  const board = []
  for (let i = 0; i < 9; i++) {
    board.push(new Array(9).fill(0))
  }
  return board
}

function populateBoard(board, numFilled) {}

function getSudokuBoard(nhints = MIN_HINTS) {
  const board = generateEmptyBoard()
  populateBoard(board, nhints)
  return board
}
