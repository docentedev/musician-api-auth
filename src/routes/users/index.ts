import { FastifyInstance, CustomRequest } from 'fastify'
import usersDb from '../../models/users'
import Auth from '../../utils/Auth'

const routes = async (fastify: FastifyInstance, _opts: any, done: Function) => {
  const qb = usersDb(fastify.pg)
  fastify.get('/', async (req: CustomRequest, reply) => {
    try {
      const { page = 1, size = 10, sort = 'desc', order = 'id' } = req.query
      const result = await qb.getAllPaginate({ page, size, sort, order })
      reply.send(result)
    } catch (error) {
      reply.send(error)
    }
  })
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string' }
        },
        required: ['username', 'email', 'password']
      }
    },
    handler: async (req: any, reply: any) => {
      try {
        const data: { password: string } & any = req.body
        data.password = await Auth.createToken(data.password)
        const result = await qb.insert(data)
        reply.send(result)
      } catch (error) {
        reply.send(error)
      }
    }
  })
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          password: { type: 'string' }
        },
        required: ['username', 'password']
      }
    },
    handler: async (req: any, reply: any) => {
      try {
        const data = req.body
        const user = await qb.getByFullData('username', data.username)
        if (!user) {
          reply.status(401).send({ message: 'Username or password is incorrect' })
        } else {
          const result = await Auth.compareToken(data.password, user.password)
          if (result) {
            const token = await reply.jwtSign({
              username: user.username,
              id: user.id
            });
            reply.send({
              ...user,
              token
            })
          } else {
            reply.status(401).send({ message: 'Username or password is incorrect' })
          }
        }
      } catch (error) {
        reply.send(error)
      }
    }
  })
  done()
}

export default routes
