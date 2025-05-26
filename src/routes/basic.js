export default async function basicRoutes(fastify, options) {
  // Basic GET/SET operations
  fastify.get('/get', async (req, reply) => {
    const key = req.query.key || 'testKey'
    try {
      const value = await fastify.iovalkey.get(key)
      return { key, value }
    } catch (err) {
      reply.code(500)
      return { error: err.message }
    }
  })

  fastify.post('/set', async (req, reply) => {
    const { key = 'testKey', value = 'testValue' } = req.body || {}
    try {
      await fastify.iovalkey.set(key, value)
      return { status: 'ok', key, value }
    } catch (err) {
      reply.code(500)
      return { error: err.message }
    }
  })
}