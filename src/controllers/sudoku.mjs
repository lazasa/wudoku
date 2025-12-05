import { getUnsolvedBoard } from './src/sudoku/generator.mjs'
import { solveSudoku } from './src/sudoku/solver.mjs'

export async function getUnsolvedBoard(req, res) {
  const { board, steps } = await getUnsolvedBoard()

  res.json({ board, steps })
}

export async function getSolvedBoard(req, res) {
  let body = ''
  req.on('data', chunk => {
    body += chunk.toString()
  })
  req.on('end', () => {
    try {
      const { board } = JSON.parse(body)
      const stepStore = []
      solveSudoku(board, stepStore)
      res.json({ board, steps: stepStore })
    } catch (error) {
      console.log(error)
      res.writeHead(400, { 'Content-Type': 'text/plain' })
      res.end('Invalid JSON')
    }
  })
}
