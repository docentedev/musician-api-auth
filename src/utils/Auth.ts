import bcrypt from 'bcrypt'

class Auth {
    static rounds: number = 10
    static createToken(password: string) {
        return bcrypt.hash(password, Auth.rounds)
    }
    static compareToken(password: string, hash: string) {
        return bcrypt.compare(password, hash)
    }
    static middleware = (fastify: any) => (request: any, reply: any, next: any) => {
        const authorization = request.headers.authorization
        if (authorization) {
            // console.log(req.user.id)
            const token = authorization.split(' ')[1]
            try {
                const result = fastify.jwt.verify(token)
                request.user = result
                next()
            } catch (error) {
                // console.log(error)
                reply.status(403).send({ message: 'Missing Auth' })
            }
        } else {
            reply.status(403).send({ message: 'Missing Auth' })
        }
    }
}

export default Auth
