import { compare } from '@/gateways/criptography/bcrypt'
import { encrypt } from '@/gateways/jwt/jwtAdapter'
import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

export const loginService = async (email: string, password: string) => {
   const user = await prisma.user.findUnique({ where: { email } })

   if (!user) {
      throw new AppError('E-mail ou senha inválidos', 400)
   }

   const isPasswordValid = await compare(password, user.password)

   if (!isPasswordValid) {
      await prisma.user.update({
         where: { id: user.id },
         data: { failedAttempts: { increment: 1 } },
      })

      if (user.failedAttempts + 1 >= 5) {
         await prisma.user.update({
            where: { id: user.id },
            data: { active: false },
         })
         throw new AppError('Usuário bloqueado após 5 tentativas de login falhadas.', 403)
      }

      throw new AppError(
         'E-mail ou senha inválidos. Cuidado, você tem mais ' + (5 - (user.failedAttempts + 1)) + ' tentativas antes que sua conta seja bloqueada.',
         400,
      )
   }

   await prisma.user.update({
      where: { id: user.id },
      data: {
         lastLogin: new Date(),
         failedAttempts: 0,
      },
   })

   const token = await encrypt({ userId: user.id, role: user.role })

   if (!token || typeof token !== 'string') {
      throw new AppError('Erro ao gerar token', 500)
   }

   await prisma.user.update({ where: { id: user.id }, data: { token, recoveryCode: null } })

   return {
      token,
      user: {
         id: user.id,
         name: user.name,
         email: user.email,
         role: user.role,
         phone: user.phone,
         cpfCnpj: user.cpfCnpj,
         lastLogin: user.lastLogin,
         avatar: user.avatar,
      },
   }
}
