import { BOARD_SIZE } from '../const/index.mjs'

class Board {
  constructor(size = BOARD_SIZE.MEDIUM) {
    this.size = size
    this.grid = Array.from({ length: size }, () => Array(size).fill(0))
    this.blockSize = Math.sqrt(size)
    if (!Number.isInteger(this.blockSize)) {
      throw new Error('Board size must be a perfect square.')
    }

    if (!Object.values(BOARD_SIZE).includes(size)) {
      throw new Error('Invalid board size.')
    }
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

  isMoveValid(row, col, num) {
    for (let x = 0; x < this.size; x++) {
      if (this.grid[row][x] === num) {
        return false
      }
    }

    for (let x = 0; x < this.size; x++) {
      if (this.grid[x][col] === num) {
        return false
      }
    }

    const startRow = row - (row % this.blockSize)
    const startCol = col - (col % this.blockSize)
    for (let i = 0; i < this.blockSize; i++) {
      for (let j = 0; j < this.blockSize; j++) {
        if (this.grid[i + startRow][j + startCol] === num) {
          return false
        }
      }
    }

    return true
  }

  isBoardValid() {
    for (let i = 0; i < this.size; i++) {
      const rowSeen = new Set()
      const colSeen = new Set()
      for (let j = 0; j < this.size; j++) {
        const rv = this.grid[i][j]
        const cv = this.grid[j][i]
        if (rv !== 0) {
          if (rowSeen.has(rv)) return false
          rowSeen.add(rv)
        }
        if (cv !== 0) {
          if (colSeen.has(cv)) return false
          colSeen.add(cv)
        }
      }
    }

    for (let br = 0; br < this.blockSize; br++) {
      for (let bc = 0; bc < this.blockSize; bc++) {
        const seen = new Set()
        const startRow = br * this.blockSize
        const startCol = bc * this.blockSize
        for (let r = 0; r < this.blockSize; r++) {
          for (let c = 0; c < this.blockSize; c++) {
            const v = this.grid[startRow + r][startCol + c]
            if (v !== 0) {
              if (seen.has(v)) return false
              seen.add(v)
            }
          }
        }
      }
    }

    return true
  }

  clone() {
    const newBoard = new Board(this.size)
    newBoard.grid = structuredClone(this.grid)
    return newBoard
  }

  static fromArray(oldGrid) {
    if (
      !Array.isArray(oldGrid) ||
      oldGrid.length === 0 ||
      !Array.isArray(oldGrid[0])
    ) {
      throw new Error('Invalid grid format.')
    }
    const size = oldGrid.length
    const board = new Board(size)
    board.grid = structuredClone(oldGrid)
    return board
  }
}

export { Board }
