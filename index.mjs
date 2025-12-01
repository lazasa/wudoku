import { Server } from './src/server.mjs'
import { readFileContent } from './src/files.mjs'

const router = Server.getRouterInstance()

// handle static files
router.get('/', async (req, res) => {
  console.log('Serving static files from /public')
  try {
    const content = await readFileContent('./public/index.html')
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(content)
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  }
})

router.get('/script.js', async (req, res) => {
  try {
    const content = await readFileContent('./public/script.js')
    res.writeHead(200, { 'Content-Type': 'application/javascript' })
    res.end(content)
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  }
})

router.get('/styles.css', async (req, res) => {
  try {
    const content = await readFileContent('./public/styles.css')
    res.writeHead(200, { 'Content-Type': 'text/css' })
    res.end(content)
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  }
})

const server = new Server(process.env.PORT || 8080, router)

server.listen(() => {
  console.log(`Server is listening on port ${process.env.PORT || 8080}`)
  console.log('Registered routes:')
  router.printTree()
})
