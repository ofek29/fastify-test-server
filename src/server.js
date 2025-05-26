import Fastify from 'fastify'
import Valkey from 'iovalkey'
import fastifyValkey from '@ofek.a/fastify-iovalkey'
import fastifyRedis from '@fastify/redis'

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
async function setupValkey () {
  // Basic setup with single client
  await fastify.register(fastifyValkey, {
    host: '127.0.0.1',
    port: 6379
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

// Setup Server with client errors
async function setupErrorClients(type) {
  // Define error clients based on the type
        const errorClients = {
        // Wrong port - connection timeout
        portError: {
          host: '127.0.0.1',
          port: 9999
        },
        
        // Invalid host - DNS error
        dnsError: {
          host: 'invalid-host.local',
          port: 6379
        }
      }
      try {
        // const valkeyClient = new Valkey({
        //   host: 'invalid-host.local',
        //   port: 6379
        // })
        if (type){
          await fastify.register(fastifyRedis, errorClients[type])
        }
      } catch (err) {
        fastify.log.error(`Expected error setting up ${type} client:`, err)
      }
    }


// Start the server
async function start() {
  try {
    await setupValkey()
    await setupErrorClients('portError')
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    fastify.log.info(`Server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  fastify.log.info(`Received ${signal}, shutting down gracefully...`)
  try {
    await fastify.close()
    fastify.log.info('Server closed successfully')
    process.exit(0)
  } catch (err) {
    fastify.log.error('Error during shutdown:', err)
    process.exit(1)
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

start()