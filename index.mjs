import { Server } from './src/core/index.mjs'
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
import crypto from 'node:crypto'

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
const server = new Server(process.env.PORT || 8080, router)
initializeWorkers()

function extractSocketFrame(buffer) {
  const opcode = buffer[0] & 0b00001111
  const isMasked = buffer[1] & 0b10000000
  const payloadLength = buffer[1] & 0b01111111
  const mask = buffer.slice(2, 6)
  const payload = buffer.slice(6, 6 + payloadLength)

  return { opcode, isMasked, payloadLength, mask, payload }
}

function createTextFrame(message) {
  const payload = Buffer.from(message)

  if (payload.length > 125) {
    throw new Error('Payload too large')
  }

  const header = Buffer.from([0x81, payload.length])
  return Buffer.concat([header, payload])
}

function sendToClient(socket, message) {
  const frame = createTextFrame(message)
  socket.write(frame)
}

const clients = new Set()
server.on('upgrade', (req, socket) => {
  if (req.headers['upgrade'] !== 'websocket') {
    socket.end('HTTP/1.1 400 Bad Request')
    return
  }

  const key = req.headers['sec-websocket-key']
  const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
  const acceptKey = crypto
    .createHash('sha1')
    .update(key + GUID)
    .digest('base64')

  socket.write(
    [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      `Sec-WebSocket-Accept: ${acceptKey}`,
      'Connection: Upgrade',
      '\r\n'
    ].join('\r\n')
  )

  clients.add(socket)
  socket.on('close', () => clients.delete(socket))
  socket.on('end', () => clients.delete(socket))
  socket.on('error', () => clients.delete(socket))

  socket.on('data', buffer => {
    const { opcode, isMasked, payloadLength, mask, payload } =
      extractSocketFrame(buffer)

    const unmasked = Buffer.alloc(payloadLength)
    for (let i = 0; i < payloadLength; i++) {
      unmasked[i] = payload[i] ^ mask[i % 4]
    }

    const message = unmasked.toString()
    console.log('client says', message)

    sendToClient(socket, `Server received: ${message}`)
  })
})

server.listen(() => {
  console.log(`Server is listening on port ${process.env.PORT || 8080}`)
  console.log('Registered routes:')
  router.printTree()
})
