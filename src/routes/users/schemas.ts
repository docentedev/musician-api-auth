export const postLoginSchema = {
    body: {
        type: 'object',
        properties: {
            username: { type: 'string' },
            password: { type: 'string' }
        },
        required: ['username', 'password']
    }
}

export const putSchema = {
    body: {
        type: 'object',
        properties: {
            username: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' }
        },
        required: ['username', 'email']
    }
}

export const postSchema = {
    body: {
        type: 'object',
        properties: {
            username: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' }
        },
        required: ['username', 'email', 'password']
    }
}