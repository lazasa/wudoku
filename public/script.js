const $ = selector => document.querySelector.bind(document)(selector)
const $$ = selector => document.querySelectorAll.bind(document)(selector)

const root = $('#root')
let currentBoard = null

function renderBoard(board) {
  root.innerHTML = ''
  const table = document.createElement('table')
  table.classList.add('sudoku-board')

  board.forEach((row, rowIndex) => {
    const tr = document.createElement('tr')
    row.forEach((cell, colIndex) => {
      const td = document.createElement('td')
      td.classList.add('sudoku-cell')
      if (cell !== 0) {
        td.textContent = cell
      } else {
        const input = document.createElement('input')
        input.type = 'text'
        input.maxLength = 1
        input.classList.add('sudoku-input')
        td.appendChild(input)
      }
      tr.appendChild(td)
    })
    table.appendChild(tr)
  })

  root.appendChild(table)
}

async function getUnsolvedBoard() {
  try {
    const response = await fetch('/sudoku')
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return data.board
  } catch (error) {
    console.error('Error fetching unsolved board:', error)
    return null
  }
}

async function getSolvedBoard(board) {
  try {
    const response = await fetch('/sudoku', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board })
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return data.board
  } catch (error) {
    console.error('Error fetching solved board:', error)
    return null
  }
}

const generateButton = $('#generate-board')
generateButton.addEventListener('click', async () => {
  const board = await getUnsolvedBoard()
  if (board) {
    currentBoard = board
    renderBoard(board)
  }
})

const solveButton = $('#solve-board')
solveButton.addEventListener('click', async () => {
  if (currentBoard) {
    const solvedBoard = await getSolvedBoard(currentBoard)
    if (solvedBoard) {
      currentBoard = solvedBoard
      renderBoard(solvedBoard)
    }
  }
})
