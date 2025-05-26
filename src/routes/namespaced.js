export default async function namespacedRoutes(fastify, options) {
  // Namespaced client operations
  fastify.get('/:namespace/get', async (req, reply) => {
    const { namespace } = req.params
    const key = req.query.key || 'testKey'
    
    if (!fastify.iovalkey[namespace]) {
      reply.code(400)
      return { error: `Namespace '${namespace}' not found` }
    }
    
    try {
      const value = await fastify.iovalkey[namespace].get(key)
      return { namespace, key, value }
    } catch (err) {
      reply.code(500)
      return { error: err.message }
    }
  })

  fastify.post('/:namespace/set', async (req, reply) => {
    const { namespace } = req.params
    const { key = 'testKey', value = 'testValue' } = req.body || {}
    
    if (!fastify.iovalkey[namespace]) {
      reply.code(400)
      return { error: `Namespace '${namespace}' not found` }
    }
    
    try {
      await fastify.iovalkey[namespace].set(key, value)
      return { status: 'ok', namespace, key, value }
    } catch (err) {
      reply.code(500)
      return { error: err.message }
    }
  })
}