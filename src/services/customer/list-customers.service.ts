import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

export const listCustomersService = async (userId: string, userRole: string) => {
   try {
   const customers = await prisma.customer.findMany()

      return customers
   } catch (error) {
      console.error(error)
      throw new AppError('Erro ao listar os clientes', 500)
   }
}
