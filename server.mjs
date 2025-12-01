import http from 'node:http'

const HTTP_METHODS = ['GET', 'POST']

class RouteNode {
  constructor() {
    this.children = new Map()
    this.handler = new Map()
    this.params = []
  }
}

class Router {
  constructor() {
    this.root = new RouteNode()
  }
}

class Server {
  PORT = null
  SERVER = null

  constructor(port, handler) {
    this.PORT = port
    this.SERVER = this.#create(handler)
  }

  #create(handleRequest) {
    if (!(this.SERVER instanceof http.Server)) {
      this.SERVER = http.createServer(handleRequest)
    }
    return this.SERVER
  }

  static getRouterInstance() {
    return new Router()
  }
}

const router = Server.getRouterInstance()

const server = new Server(process.env.PORT || 8080, (req, res) => {
  if (!HTTP_METHODS.includes(req.method)) {
    res.writeHead(405, { 'Content-Type': 'text/plain' })
    return res.end('Method Not Allowed')
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Hello, World!')
})
