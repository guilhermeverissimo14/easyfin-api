import { AppError } from '@/helpers/app-error'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
