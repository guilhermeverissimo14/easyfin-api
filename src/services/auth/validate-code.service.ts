import { AppError } from '@/helpers/app-error'
import { compare } from 'bcrypt'
import { prisma } from '@/lib/prisma'

export const validateCodeService = async (email: string, code: string) => {
   const user = await prisma.user.findUnique({ where: { email } })

   if (!user) {
      throw new AppError('Usuário não encontrado', 404)
   }

   if (!user.recoveryCode) {
      throw new AppError('Código de recuperação expirado ou não encontrado', 404)
   }

   const isValidCode = await compare(code, user.recoveryCode)

   if (!isValidCode) {
      throw new AppError('Código de recuperação inválido', 400)
   }

   return 'Código validado com sucesso'
}
