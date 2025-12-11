import http from 'node:http'
import { Router } from './router.mjs'

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
      this.SERVER = http.createServer(async (req, res) => {
        res.json = (data, status = 200) => {
          res.writeHead(status, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(data, null, 2))
        }

        const routeResult = router.findRoute(req.method, req.url)

        if (!routeResult) {
          res.writeHead(404, { 'Content-Type': 'text/plain' })
          res.end('Route Not Found')
          return
        }

        const { handler, params } = routeResult
        req.params = params

        try {
          const maybePromise = handler(req, res)
          if (maybePromise && typeof maybePromise.then === 'function') {
            await maybePromise
          }
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' })
          res.end('Internal Server Error')
        }
      })
    }

    return this.SERVER
  }

  static getRouterInstance() {
    return new Router()
  }

  getHttpServer() {
    return this.SERVER
  }

  listen(callback) {
    this.SERVER.listen(this.PORT, callback)
  }

  close(callback) {
    this.SERVER.close(callback)
  }
}

export { Server }
