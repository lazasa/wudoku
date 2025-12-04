import { Server } from './src/server.mjs'
import { readFileContent } from './src/files.mjs'
import { getUnsolvedBoard } from './src/sudoku/generator.mjs'
import { solveSudoku } from './src/sudoku/solver.mjs'
import { Worker } from 'worker_threads'

const router = Server.getRouterInstance()

const cache = {}

async function getCached(path) {
  if (!cache[path]) {
    cache[path] = await readFileContent(path)
  }
  return cache[path]
}

// handle static files
router.get('/', async (req, res) => {
  console.log('Serving static files from /public')
  try {
    const content = await getCached('./public/index.html')
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600'
    })
    res.end(content)
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  }
})

router.get('/script.js', async (req, res) => {
  try {
    const content = await getCached('./public/script.js')
    res.writeHead(200, {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600'
    })
    res.end(content)
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  }
})

router.get('/styles.css', async (req, res) => {
  try {
    const content = await getCached('./public/styles.css')
    res.writeHead(200, {
      'Content-Type': 'text/css',
      'Cache-Control': 'public, max-age=3600'
    })
    res.end(content)
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  }
})

router.get('/favicon.ico', async (req, res) => {
  try {
    const content = await getCached('./public/favicon.ico')
    res.writeHead(200, {
      'Content-Type': 'image/x-icon',
      'Cache-Control': 'public, max-age=3600'
    })
    res.end(content)
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  }
})

// Returns a new unsolved Sudoku board
router.get('/sudoku', async (req, res) => {
  const { board, steps } = await getUnsolvedBoard()

  res.json({ board, steps })
})

// Solves the provided Sudoku board
router.post('/sudoku', async (req, res) => {
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
})

const server = new Server(process.env.PORT || 8080, router)

const sudokuWorker = new Worker('./src/workers/sudokuWorker.mjs', {
  type: 'module'
})

sudokuWorker.onmessage = event => {
  console.log('Message from sudokuWorker:', event.data)
}

sudokuWorker.postMessage('Hello, worker!')

server.listen(() => {
  console.log(`Server is listening on port ${process.env.PORT || 8080}`)
  console.log('Registered routes:')
  router.printTree()
})
