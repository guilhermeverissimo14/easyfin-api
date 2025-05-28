import jwt from 'jsonwebtoken'

interface DecodedToken {
   userId: string
   role: string
   iat: number
   exp: number
}

export const encrypt = async (payload: object): Promise<string> => {
   const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' })
   return token
}

export const decrypt = async (token: string): Promise<DecodedToken> => {
   const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as DecodedToken
   return decoded
}
