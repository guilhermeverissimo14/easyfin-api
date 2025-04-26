import { hash } from '@/gateways/criptography/bcrypt'
import { sendRecoveryEmail } from '@/gateways/email/nodemailer.service'
import { AppError } from '@/helpers/app-error'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const forgotPasswordService = async (email: string) => {
   const user = await prisma.user.findUnique({ where: { email } })

   if (!user) {
      throw new AppError('Usuário não encontrado', 404)
   }

   const generateCode = Math.floor(100000 + Math.random() * 900000).toString()
   const hashRecoveryCode = await hash(generateCode)

   try {
      await prisma.user.update({
         where: { id: user.id },
         data: { recoveryCode: hashRecoveryCode },
      })
      await sendRecoveryEmail(user.email, user.name, generateCode)
      return 'E-mail de recuperação enviado com sucesso'
   } catch (error) {
      throw new AppError('Erro ao enviar e-mail de recuperação', 500)
   }
}
