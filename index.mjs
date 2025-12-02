import { Server } from './src/server.mjs'
import { readFileContent } from './src/files.mjs'

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

const server = new Server(process.env.PORT || 8080, router)

server.listen(() => {
  console.log(`Server is listening on port ${process.env.PORT || 8080}`)
  console.log('Registered routes:')
  router.printTree()
})
