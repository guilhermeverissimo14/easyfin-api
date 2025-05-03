import { PrismaClient, UserRole  } from '@prisma/client'
import { AppError } from '@/helpers/app-error'
import { formatCpfCnpj, formatPhone } from '@/utils/format'
import { hash } from '@/gateways/criptography/bcrypt'
import { sendWelcomeEmail } from '@/gateways/email/nodemailer.service'

const prisma = new PrismaClient()

export const createUserService = async (userData: {
   name: string
   email: string
   password: string
   role: UserRole
   phone?: string | null
   cpfCnpj?: string | null
   userRole: UserRole
}) => {
   const { email, role, userRole } = userData

   if (userRole !== UserRole.ADMIN && role === UserRole.ADMIN) {
      throw new AppError('Acesso negado. Somente Administradores podem criar Administradores', 403)
   }

   if (userRole === UserRole.USER) {
      throw new AppError('Acesso negado.', 403)
   }

   const existingUser = await prisma.user.findUnique({ where: { email } })

   if (existingUser) {
      throw new AppError('E-mail já está em uso', 400)
   }

   const generatePassword = Math.random().toString(36).slice(-8)
   const hashedPassword = await hash(generatePassword)

   if (userData.cpfCnpj) {
      userData.cpfCnpj = formatCpfCnpj(userData.cpfCnpj)
   }

   if (userData.phone) {
      userData.phone = formatPhone(userData.phone)
   }

   const { userRole: userRoleToRemove, ...userDataWithoutUserRole } = userData

   let user = null

   try {
      user = await prisma.user.create({
         data: {
            ...userDataWithoutUserRole,
            role: role,
            password: hashedPassword,
         },
      })
   } catch (error) {
      console.log(error)
      throw new AppError('Erro ao criar o usuário', 500)
   }

   await sendWelcomeEmail(user.email, user.name, generatePassword)

   const { password: _, ...userWithoutPassword } = user
   return userWithoutPassword
}
