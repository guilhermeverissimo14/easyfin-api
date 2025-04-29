import { PrismaClient} from '@prisma/client'
import { AppError } from '@/helpers/app-error'
import { UserRole } from '@/models/user.model'

const prisma = new PrismaClient()

export const toggleUserStatusService = async (id: string, userRole: string, userId: string) => {
   const user = await prisma.user.findUnique({ where: { id } })

   if (!user) {
      throw new AppError('Usuário não encontrado', 404)
   }

   if (userRole === UserRole.ADMIN) {
      const updatedUser = await prisma.user.update({
         where: { id },
      })
      return updatedUser
   }

   throw new AppError('Acesso negado', 403)
}
