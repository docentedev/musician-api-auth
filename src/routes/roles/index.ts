import { FastifyInstance, CustomRequest } from 'fastify'
import rolesDb from '../../models/roles'
import Auth from '../../utils/Auth'

const routes = async (fastify: FastifyInstance, _opts: any, done: Function) => {
  const qb = rolesDb(fastify.pg)
  fastify.get('/accounts/:id', {
    preHandler: [Auth.rolesMiddleware(fastify, ['admin'])],
    handler: async (req: CustomRequest, reply) => {
      try {
        const { id } = req.params
        const result = await qb.getByAccountId(id)
        reply.send(result)
      } catch (error) {
        reply.send(error)
      }
    }
  })
  done()
}

export default routes
