import { PrismaClient } from '@prisma/client'
import { AppError } from '@/helpers/app-error'
import { UserRole } from '@/models/user.model'

const prisma = new PrismaClient()

export const deleteCustomerService = async (id: string, userRole: string) => {
   const customer = await prisma.customer.findUnique({ where: { id } })

   if (!customer) {
      throw new AppError('Cliente não encontrado', 404)
   }

   if (userRole === UserRole.ADMIN) {
      await prisma.customer.delete({
         where: { id },
      })
      return customer
   }

   throw new AppError('Acesso negado', 403)
}
