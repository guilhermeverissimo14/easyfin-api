import { decrypt, encrypt } from '@/gateways/jwt/jwtAdapter'
import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

export const refreshTokenService = async (token: string) => {
   const verifyToken = await prisma.user.findFirst({ where: { token } })

   if (!verifyToken) {
      throw new AppError('Token não encontrado', 404)
   }

   const { id, email, role } = verifyToken

   const decoded = await decrypt(token)

   if (!decoded) {
      throw new AppError('Token inválido', 400)
   }

   if (decoded.exp * 1000 < Date.now()) {
      throw new AppError('Token expirado', 401)
   }

   const newToken = await encrypt({ userId: id, role: role })

   if (!newToken || typeof newToken !== 'string') {
      throw new AppError('Erro ao gerar token', 500)
   }

   await prisma.user.update({ where: { id }, data: { token: newToken } })

   return newToken
}
