import Fastify from 'fastify'
const jwt = require('@fastify/jwt')
import usersRoute from './routes/users'
import rolesRoute from './routes/roles'
import profilesRoute from './routes/profiles'

require('dotenv').config()

const PORT = process.env.PORT || 3001
const fastify = Fastify({
  logger: true
})

fastify.register(jwt, {
  decode: { complete: true },
  secret: {
    private: process.env.PRIVATE_KEY,
    public: process.env.PUBLIC_KEY
  },
  sign: { algorithm: 'RS256' }
})

fastify.register(require('@fastify/postgres'), {
  connectionString: process.env.DATABASE_URL
})

fastify.register(require('./routes/health'), { prefix: 'api/v1/health' })
fastify.register(usersRoute, { prefix: 'api/v1/users' })
fastify.register(rolesRoute, { prefix: 'api/v1/roles' })
fastify.register(profilesRoute, { prefix: 'api/v1/profiles' })

fastify.listen({
  port: Number(PORT),
  host: '0.0.0.0'
}, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
  fastify.log.info(`Server listening on ${address}`)
})
