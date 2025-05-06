import { PrismaClient } from '@prisma/client'
import { AppError } from '@/helpers/app-error'
import { UserRole } from '@/models/user.model'

const prisma = new PrismaClient()

export const listCustomersService = async (userId: string, userRole: string) => {
   try {
      if (userRole !== UserRole.ADMIN) {
         throw new AppError('Permissão negada', 403)
      }

      const customers = await prisma.customer.findMany()

      return customers
   } catch (error) {
      console.error(error)
      throw new AppError('Erro ao listar os clientes', 500)
   }
}
