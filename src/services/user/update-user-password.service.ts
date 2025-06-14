import { PrismaClient, UserRole } from '@prisma/client'
import { AppError } from '@/helpers/app-error'
import { compare, hash } from '@/gateways/criptography/bcrypt'

const prisma = new PrismaClient()

export const updateUserPasswordService = async (id: string, userData: { password: string; newPassword: string }, userRole: string, userId: string) => {
   const { password, newPassword } = userData

   const user = await prisma.user.findUnique({ where: { id } })

   if (!user) {
      throw new AppError('Usuário não encontrado', 404)
   }

   if (user.id !== userId || user.id !== id) {
      throw new AppError('Acesso negado', 403)
   }

   const passwordMatches = await compare(password, user.password)

   if (!passwordMatches) {
      throw new AppError('Senha atual incorreta', 401)
   }

   const hashedNewPassword = await hash(newPassword)

   const passwordIsEqual = await compare(password, hashedNewPassword)

   if (passwordIsEqual) {
      throw new AppError('A nova senha não pode ser igual a senha atual', 400)
   }

   const updatedUser = await prisma.user.update({
      where: { id },
      data: {
         password: hashedNewPassword,
         passwordResetAt: null,
      },
   })

   const { password: _, ...userWithoutPassword } = updatedUser

   return userWithoutPassword
}
