import { PrismaClient} from '@prisma/client'
import { AppError } from '@/helpers/app-error'
import { formatCpfCnpj, formatPhone } from '@/utils/format'
import { UserRole } from '@/models/user.model'

const prisma = new PrismaClient()

export const updateUserService = async (id: string, userData: any, userRole: string, userId: string) => {
   const user = await prisma.user.findUnique({ where: { id } })

   if (!user) {
      throw new AppError('Usuário não encontrado', 404)
   }

   if (userData.cpfCnpj) {
      userData.cpfCnpj = formatCpfCnpj(userData.cpfCnpj)
   }

   if (userData.phone) {
      userData.phone = formatPhone(userData.phone)
   }

   if (userRole === UserRole.ADMIN) {
      return await prisma.user.update({
         where: { id },
         data: userData,
      })
   }


   throw new AppError('Acesso negado', 403)
}
