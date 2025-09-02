import { AppError } from '@/helpers/app-error'
import { UserRole } from '@/models/user.model'
import { prisma } from '@/lib/prisma'

export const toggleCustomerStatusService = async (id: string, userRole: string) => {
   const customer = await prisma.customer.findUnique({ where: { id } })

   if (!customer) {
      throw new AppError('Cliente não encontrado', 404)
   }

   if (userRole === UserRole.ADMIN) {
      const updatedCustomer = await prisma.customer.update({
         where: { id },
         data: {
            active: !customer.active,
         },
      })
      return updatedCustomer
   }

   throw new AppError('Acesso negado', 403)
}
