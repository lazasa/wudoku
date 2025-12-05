import { Server } from './src/server.mjs'
import {
  serveFavicon,
  serveHtml,
  serveScript,
  serveStyles
} from './src/controllers/static.mjs'
import { getUnsolvedBoard, getSolvedBoard } from './src/controllers/sudoku.mjs'
import { Worker } from 'worker_threads'

const router = Server.getRouterInstance()

// handle static files
router.get('/', serveHtml)
router.get('/script.js', serveScript)
router.get('/styles.css', serveStyles)
router.get('/favicon.ico', serveFavicon)

// Sudoku
router.get('/sudoku', getUnsolvedBoard)
router.post('/sudoku', getSolvedBoard)

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
