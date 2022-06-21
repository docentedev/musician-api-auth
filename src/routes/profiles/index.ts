import { FastifyInstance } from 'fastify'
import usersDb from '../../models/users'
import Auth from '../../utils/Auth'

const routes = async (fastify: FastifyInstance, _opts: any, done: Function) => {
  const qb = usersDb(fastify.pg)
  fastify.get('/', {
    preHandler: [Auth.middleware(fastify)],
    handler: async (req: any, reply) => {
      try {
        const result = await qb.getBy('id', req.user.id)
        reply.send(result)
      } catch (error) {
        reply.send(error)
      }
    }
  })
  done()
}

export default routes
