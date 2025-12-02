function printBoard(board) {
  for (let r = 0; r < 9; r++) {
    let row = ''
    for (let d = 0; d < 9; d++) {
      row += board[r][d] + ' '
    }
    console.log(row)
  }
}

function compareBoards(board1, board2) {
  for (let r = 0; r < 9; r++) {
    for (let d = 0; d < 9; d++) {
      if (board1[r][d] !== board2[r][d]) {
        return false
      }
    }
  }
  return true
}

function printCompareBoards(board1, board2) {
  console.log('-- Board 1:')
  printBoard(board1)
  console.log('-- Board 2:')
  printBoard(board2)
}

export { printBoard, compareBoards, printCompareBoards }
