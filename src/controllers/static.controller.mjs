import path, { dirname } from 'node:path'
import { readFileContent } from '../core/files.mjs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log(__dirname)

const cache = {} // redis or memcached would be better for production
const publicDirPath = path.resolve(__dirname, '../../public')

async function getCached(filePath) {
  if (!cache[filePath]) {
    cache[filePath] = await readFileContent(filePath)
  }
  return cache[filePath]
}

export async function serveHtml(req, res) {
  console.log('Serving static files from /public')
  try {
    const content = await getCached(path.join(publicDirPath, 'index.html'))
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600'
    })
    res.end(content)
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  }
}

export async function serveScript(req, res) {
  try {
    const content = await getCached(path.join(publicDirPath, 'script.js'))
    res.writeHead(200, {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600'
    })
    res.end(content)
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  }
}

export async function serveFavicon(req, res) {
  try {
    const content = await getCached(path.join(publicDirPath, 'favicon.ico'))
    res.writeHead(200, {
      'Content-Type': 'image/x-icon',
      'Cache-Control': 'public, max-age=3600'
    })
    res.end(content)
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  }
}

export async function serveStyles(req, res) {
  try {
    const content = await getCached(path.join(publicDirPath, 'styles.css'))
    res.writeHead(200, {
      'Content-Type': 'text/css',
      'Cache-Control': 'public, max-age=3600'
    })
    res.end(content)
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  }
}
