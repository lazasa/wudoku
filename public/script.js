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

function renderStep(step) {
  const cellIndex = step.row * 9 + step.col
  const cell = $$('.sudoku-cell')[cellIndex]
  cell.textContent = step.value === 0 ? '' : step.value
}

// Fisher-Yates (Knuth) shuffle
function shuffleArray(array) {
  let currentIndex = array.length
  let randomIndex

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex]
    ]
  }

  return array
}

function renderSteps(steps) {
  const queue = shuffleArray([...steps])

  const interval = setInterval(() => {
    if (queue.length === 0) {
      clearInterval(interval)
      return
    }
    const step = queue.shift()
    renderStep(step)
  }, 10)
}

async function getUnsolvedBoard() {
  try {
    const response = await fetch('/sudoku')
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return { board: data.board, steps: data.steps }
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

    return { board: data.board, steps: data.steps }
  } catch (error) {
    console.error('Error fetching solved board:', error)
    return null
  }
}

const generateButton = $('#generate-board')
generateButton.addEventListener('click', async () => {
  const { board, steps } = await getUnsolvedBoard()

  if (!currentBoard) {
    currentBoard = board
    renderBoard(board)
  } else {
    currentBoard = board
    renderSteps(steps)
  }
})

const solveButton = $('#solve-board')
solveButton.addEventListener('click', async () => {
  if (currentBoard) {
    const { board: solvedBoard, steps } = await getSolvedBoard(currentBoard)
    if (solvedBoard) {
      currentBoard = solvedBoard
      renderSteps(steps)
    }
  }
})
