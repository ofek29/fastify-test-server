export default async function testRoutes(fastify, options) {
  // Health check route
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  // Route to test all functionalities at once
  fastify.get('/test-all', async (req, reply) => {
    const results = {}
    
    try {
      // Test basic operations
      await fastify.iovalkey.set('testKey', 'testValue')
      results.basicGet = await fastify.iovalkey.get('testKey')
      
      // Test namespaced operations
      await fastify.iovalkey.test1.set('nsKey', 'nsValue1')
      await fastify.iovalkey.test2.set('nsKey', 'nsValue2')
      results.namespace1 = await fastify.iovalkey.test1.get('nsKey')
      results.namespace2 = await fastify.iovalkey.test2.get('nsKey')
      
      // Test streams
      const streamName = 'testStream'
      const streamId = await fastify.iovalkey.xadd([streamName, '*', 'field1', 'value1', 'field2', 'value2'])
      const streamData = await fastify.iovalkey.xread(['STREAMS', streamName, 0])
      results.streamId = streamId
      results.streamEntries = streamData ? streamData.length : 0
      
      return { status: 'success', results }
    } catch (err) {
      reply.code(500)
      return { error: err.message, results }
    }
  })
}