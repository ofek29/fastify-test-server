import Fastify from 'fastify'
import Valkey from 'iovalkey'
import fastifyValkey from '@ofek.a/fastify-iovalkey'

// Import route modules
import basicRoutes from './routes/basic.js'
import namespacedRoutes from './routes/namespaced.js'
import streamsRoutes from './routes/streams.js'
import testRoutes from './routes/test.js'

// Create fastify server with detailed logging
const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty'
    }
  }
})

// Setup server with various Valkey configurations
async function setupServer() {
  // Basic setup with single client
  await fastify.register(fastifyValkey, {
    host: '127.0.0.1',
    port: 6379,
    // Uncomment if you need authentication
    // password: 'your-password', 
    family: 4
  })

  // Setup namespaced clients
  const valkeyClient = new Valkey({ host: '127.0.0.1', port: 6379 })
  
  await fastify.register(fastifyValkey, {
    host: '127.0.0.1',
    port: 6379,
    namespace: 'test1'
  })
  
  await fastify.register(fastifyValkey, {
    client: valkeyClient,
    namespace: 'test2',
    closeClient: true
  })

  // Register route modules
  await fastify.register(basicRoutes, { prefix: '/basic' })
  await fastify.register(namespacedRoutes, { prefix: '/namespaced' })
  await fastify.register(streamsRoutes, { prefix: '/streams' })
  await fastify.register(testRoutes)
}

// Start the server
async function start() {
  try {
    await setupServer()
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    fastify.log.info(`Server listening on ${fastify.server.address().port}`)
    fastify.log.info('Available test endpoints:')
    fastify.log.info('- GET /health')
    fastify.log.info('- GET /test-all')
    fastify.log.info('- GET /basic/get?key=yourKey')
    fastify.log.info('- POST /basic/set (body: {key, value})')
    fastify.log.info('- GET /namespaced/:namespace/get?key=yourKey')
    fastify.log.info('- POST /namespaced/:namespace/set (body: {key, value})')
    fastify.log.info('- POST /streams/add (body: {streamName, field, value})')
    fastify.log.info('- GET /streams/read?streamName=yourStream&id=0')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()