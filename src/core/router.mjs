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
    this.params = {}
    this.paramName = null
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
    const segments = path.split('/').filter(Boolean)
    let currentNode = this.root
    let dynamicParams = []

    if (segments.length === 0) {
      currentNode.handler.set(method, handler)
      return
    }

    for (let seg of segments) {
      const isDynamic = seg.startsWith(':')
      let key = seg

      if (isDynamic) {
        const name = seg.slice(1)
        key = ':'
        dynamicParams.push(name)

        if (currentNode.children.has(key)) {
          const existingNode = currentNode.children.get(key)
          if (existingNode?.paramName !== name) {
            throw new Error(
              `Conflicting parameter names in route definitions: ${existingNode.paramName} and ${name}`
            )
          }
        }
      }

      if (!currentNode.children.has(key)) {
        const newRoute = new RouteNode()
        if (isDynamic) newRoute.paramName = seg.slice(1)
        currentNode.children.set(key, newRoute)
      }

      currentNode = currentNode.children.get(key)
    }

    currentNode.handler.set(method, handler)
    currentNode.params = dynamicParams
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
    const [rawPath] = path.split('?')
    const segments = rawPath
      .split('/')
      .filter(Boolean)
      .map(s => {
        try {
          return decodeURIComponent(s)
        } catch (e) {
          return s
        }
      })

    let currentNode = this.root
    const params = {}

    if (segments.length === 0) {
      const handler = currentNode.handler.get(method) || null
      return handler ? { handler, params } : null
    }

    for (let seg of segments) {
      // static first
      if (currentNode.children.has(seg)) {
        currentNode = currentNode.children.get(seg)
        continue
      }

      // dynamic next
      if (currentNode.children.has(':')) {
        const paramNode = currentNode.children.get(':')
        if (!paramNode.paramName) {
          return null
        }

        params[paramNode.paramName] = seg
        currentNode = paramNode
        continue
      }

      return null
    }

    const handler = currentNode.handler.get(method) || null
    return handler ? { handler, params } : null
  }
}

export { Router }
