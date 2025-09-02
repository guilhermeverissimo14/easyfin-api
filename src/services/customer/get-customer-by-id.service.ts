import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

export const getCustomerByIdService = async (id: string) => {
   try {
      const customer = await prisma.customer.findUnique({
         where: {
            id: id,
         },
      })

      if (!customer) {
         throw new AppError('Cliente não encontrado', 404)
      }

      return customer
   } catch (error) {
      if (error instanceof AppError) {
         throw error
      }
      console.error(error)
      throw new AppError('Erro ao buscar o cliente', 500)
   }
}
