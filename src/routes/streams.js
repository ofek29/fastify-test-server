export default async function streamsRoutes(fastify, options) {
  // Streams operations
  fastify.post('/add', async (req, reply) => {
    const { streamName = 'myStream', field = 'message', value = 'Hello Valkey Streams!' } = req.body || {}
    
    try {
      const streamId = await fastify.iovalkey.xadd([streamName, '*', field, value])
      return { status: 'ok', streamName, streamId }
    } catch (err) {
      reply.code(500)
      return { error: err.message }
    }
  })

  fastify.get('/read', async (req, reply) => {
    const { streamName = 'myStream', id = '0' } = req.query
    
    try {
      const streamData = await fastify.iovalkey.xread(['STREAMS', streamName, id])
      
      if (!streamData || streamData.length === 0) {
        return { streamName, entries: [] }
      }
      
      const entries = streamData[0][1].map(entry => {
        const entryId = entry[0].toString()
        const fields = {}
        
        // Parse fields and values
        for (let i = 0; i < entry[1].length; i += 2) {
          fields[entry[1][i].toString()] = entry[1][i+1].toString()
        }
        
        return { id: entryId, fields }
      })
      
      return { streamName, entries }
    } catch (err) {
      reply.code(500)
      return { error: err.message }
    }
  })
}