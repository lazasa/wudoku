import { Server } from './src/server.mjs'
import {
  serveFavicon,
  serveHtml,
  serveScript,
  serveStyles
} from './src/controllers/static.controller.mjs'
import {
  getUnsolvedBoard,
  getSolvedBoard
} from './src/controllers/sudoku.controller.mjs'
import { initializeWorkers } from './src/workers/workers.mjs'

const router = Server.getRouterInstance()

// handle static files
router.get('/', serveHtml)
router.get('/script.js', serveScript)
router.get('/styles.css', serveStyles)
router.get('/favicon.ico', serveFavicon)

// Sudoku
router.get('/sudoku', getUnsolvedBoard)
router.post('/sudoku', getSolvedBoard)

// Create http server and workers
const server = new Server(process.env.PORT || 80, router)
initializeWorkers()

server.listen(() => {
  console.log(`Server is listening on port ${process.env.PORT || 80}`)
  console.log('Registered routes:')
  router.printTree()
})
