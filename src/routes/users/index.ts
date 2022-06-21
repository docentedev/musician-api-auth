import { FastifyInstance, CustomRequest } from 'fastify'
import usersDb from '../../models/users'
import Auth from '../../utils/Auth'
import rolesDb from '../../models/roles'
import { errorReplyForbidden, errorReplyUserNotFound, errorReplyUserPasswordIncorrect } from '../../utils/errorResponse'
import { postLoginSchema, postSchema, putSchema } from './schemas'

const routes = async (fastify: FastifyInstance, _opts: any, done: Function) => {
  const qb = usersDb(fastify.pg)
  const roleQb = rolesDb(fastify.pg)
  fastify.get('/', {
    preHandler: [Auth.rolesMiddleware(fastify, ['admin'])],
    handler: async (req: CustomRequest, reply) => {
      try {
        const { page = 1, size = 10, sort = 'desc', order = 'id' } = req.query
        const result = await qb.getAllPaginate({ page, size, sort, order })
        reply.send(result)
      } catch (error) {
        reply.send(error)
      }
    }
  })
  fastify.get('/:id', {
    preHandler: [Auth.rolesMiddleware(fastify, ['admin'])],
    handler: async (req: CustomRequest, reply) => {
      try {
        const result = await qb.getBy('id', req.params.id)
        reply.send(result)
      } catch (error) {
        reply.send(error)
      }
    }
  })
  fastify.post('/', {
    schema: postSchema,
    handler: async (req: any, reply: any) => {
      try {
        if (process.env.FLAG_USER_CREATE === 'true') {
          const data: { password: string } & any = req.body
          data.password = await Auth.createToken(data.password)
          const result = await qb.insert(data)
          reply.send(result)
        } else reply.send({ message: 'FLAG_USER_CREATE=false' })
      } catch (error) {
        reply.send(error)
      }
    }
  })
  fastify.put('/:id', {
    schema: putSchema,
    preHandler: [Auth.middleware(fastify)],
    handler: async (req: any, reply: any) => {
      if (req.user.id !== req.params.id) return errorReplyForbidden(reply)
      try {
        const prevUser = await qb.getByUsernameOrEmail(req.body.username, req.body.email)
        const prevIds = prevUser.map((item: any) => item.id)
        // if (!prevIds.includes(req.params.id)) return reply.status(404).send({ message: 'User not found' })
        if (prevIds.some((item: any) => item !== req.params.id)) throw new Error('Username or email already exist')

        const data: { username: string, email: string } & any = req.body
        if (data.password) { data.password = await Auth.createToken(data.password) }

        const result = await qb.update(req.params.id, data)
        if (result.length === 0) errorReplyUserNotFound(reply)
        else reply.send(result[0])
      } catch (error) {
        reply.send(error)
      }
    }
  })
  fastify.post('/login', {
    schema: postLoginSchema,
    handler: async (req: any, reply: any) => {
      try {
        const data = req.body
        const user = await qb.getByFullData('username', data.username)
        if (!user) errorReplyUserPasswordIncorrect(reply)
        else {
          const result = await Auth.compareToken(data.password, user.password)
          const rolesResult = await roleQb.getByAccountId(user.id)
          const roles = [...new Set(rolesResult.map((role: any) => role.name))]
          if (result) {
            const token = await reply.jwtSign({ username: user.username, id: user.id, roles })
            reply.send({ ...user, token })
          } else errorReplyUserPasswordIncorrect(reply)
        }
      } catch (error) {
        reply.send(error)
      }
    }
  })
  done()
}

export default routes
