import http from 'node:http'

const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST'
}

class RouteNode {
  constructor() {
    // Map of child nodes
    // key: path segment, value: RouteNode
    this.children = new Map()
    this.handler = new Map()
    this.params = []
  }
}

class Router {
  constructor() {
    this.root = new RouteNode()
  }

  #verifyParams(method, path, handler) {
    if (
      !HTTP_METHODS[method] ||
      typeof path !== 'string' ||
      typeof handler !== 'function'
    ) {
      throw new Error(`Invalid route definition`)
    }
  }

  #addRoute(method, path, handler) {
    this.#verifyParams(method, path, handler)
    // hello/world
    const segments = path.split('/').filter(Boolean) // []
    // ['hello', 'world']
    let currentNode = this.root

    if (segments.length === 0) {
      currentNode.handler.set(method, handler)
      return
    }

    for (let seg of segments) {
      // If the segment does not exist, create a new RouteNode and set the handler
      if (!currentNode.children.has(seg)) {
        const newRoute = new RouteNode()
        newRoute.handler.set(method, handler)
        currentNode.children.set(seg, newRoute)
      }
      // The segment might exist, but the handler for the method might not
      else if (!currentNode.children.get(seg).handler.has(method)) {
        currentNode.children.get(seg).handler.set(method, handler)
      }

      currentNode = currentNode.children.get(seg)
    }
  }

  get(path, handler) {
    this.#addRoute(HTTP_METHODS.GET, path, handler)
  }

  post(path, handler) {
    this.#addRoute(HTTP_METHODS.POST, path, handler)
  }

  printTree(node = this.root, indentation = 0) {
    const indent = '-'.repeat(indentation)
    node.children.forEach((childNode, part) => {
      console.log(`${indent} /${part} [${[...childNode.handler.keys()]}]`)
      this.printTree(childNode, indentation + 1)
    })
  }

  findRoute(method, path) {
    const segments = path.split('/').filter(Boolean)
    let currentNode = this.root

    if (segments.length === 0) {
      return currentNode.handler.get(method) || null
    }

    for (let seg of segments) {
      if (!currentNode.children.has(seg)) {
        return null
      }
      currentNode = currentNode.children.get(seg)
    }

    return currentNode.handler.get(method) || null
  }
}

class Server {
  PORT = null
  SERVER = null

  constructor(port, router) {
    this.PORT = port
    this.SERVER = this.#create(router)
  }

  #create(router) {
    const isServerInstance = this.SERVER instanceof http.Server
    const isRouterInstance = router instanceof Router

    if (!isRouterInstance) {
      throw new Error(`Invalid router instance`)
    }

    if (!isServerInstance) {
      this.SERVER = http.createServer((req, res) => {
        const handler = router.findRoute(req.method, req.url)

        if (handler) {
          res.json = (data, status = 201) => {
            res.writeHead(status, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(data, null, 2))
          }

          handler(req, res)
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' })
          res.end('Route Not Found')
        }
      })
    }

    return this.SERVER
  }

  static getRouterInstance() {
    return new Router()
  }

  listen(callback) {
    this.SERVER.listen(this.PORT, callback)
  }

  close(callback) {
    this.SERVER.close(callback)
  }
}

export { Server, Router }
