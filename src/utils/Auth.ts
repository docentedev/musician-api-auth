import bcrypt from 'bcrypt'

class Auth {
    static rounds: number = 10 
    static createToken(password: string) {
        return bcrypt.hash(password, Auth.rounds)
    }
    static compareToken(password: string, hash: string) {
        return bcrypt.compare(password, hash)
    }
}

export default Auth
