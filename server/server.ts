import app from './app.js'

const DEFAULT_PORT = 3001
const requestedPort = Number(process.env.PORT) || DEFAULT_PORT

const startServer = async () => {
  const maxAttempts = 10
  let port = requestedPort

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const server = app.listen(port)

      await new Promise<void>((resolve, reject) => {
        server.once('listening', resolve)
        server.once('error', reject)
      })

      console.log(`Server ready on port ${port}`)
      return server
    } catch (err: any) {
      if (err && err.code === 'EADDRINUSE') {
        port += 1
        continue
      }
      throw err
    }
  }

  throw new Error(`Failed to start server: ports ${requestedPort}-${requestedPort + maxAttempts - 1} are in use`)
}

await startServer()
