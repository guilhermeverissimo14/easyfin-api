import { AppError } from '@/helpers/app-error'
import { UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const deleteTaxRateService = async (id: string, userRole: string) => {
   if (userRole !== UserRole.ADMIN) {
      throw new AppError('Acesso negado', 403)
   }

   const taxRate = await prisma.taxRates.findUnique({
      where: {
         id,
      },
   })

   if (!taxRate) {
      throw new AppError('Taxa não encontrada', 404)
   }

   try {
      await prisma.taxRates.delete({
         where: {
            id,
         },
      })
   } catch (error) {
      console.error(error)
      throw new Error('Erro ao deletar a taxa')
   }
}
