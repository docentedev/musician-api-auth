import { FastifyReply } from "fastify"

export const errorReplyUserPasswordIncorrect = (reply: FastifyReply): void => {
    reply.status(401).send({ message: 'Username or password is incorrect' })
}

export const errorReplyUserNotFound = (reply: FastifyReply): void => {
    reply.status(404).send({ message: 'User not found' })
}

export const errorReplyForbidden = (reply: FastifyReply): void => {
    reply.status(403).send({ message: 'Forbidden' })
}