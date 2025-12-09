class Board {
  constructor(size = 9) {
    this.size = size
    this.grid = Array.from({ length: size }, () => Array(size).fill(0))
    this.blockSize = Math.sqrt(size)
  }

  getRow(row) {
    return this.grid[row]
  }

  getColumn(col) {
    return this.grid.map(row => row[col])
  }

  getBlock(blockRow, blockCol) {
    const block = []
    const startRow = blockRow * this.blockSize
    const startCol = blockCol * this.blockSize

    for (let r = 0; r < this.blockSize; r++) {
      for (let c = 0; c < this.blockSize; c++) {
        block.push(this.grid[startRow + r][startCol + c])
      }
    }
    return block
  }

  setCell(row, col, value) {
    this.grid[row][col] = value
  }

  getCell(row, col) {
    return this.grid[row][col]
  }
}
