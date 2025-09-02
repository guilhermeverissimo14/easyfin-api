import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

export const getTaxRateByIdService = async (id: string) => {
   const taxRate = await prisma.taxRates.findUnique({
      where: {
         id,
      },
   })

   if (!taxRate) {
      throw new AppError('Taxa não encontrada', 404)
   }

   return taxRate
}
