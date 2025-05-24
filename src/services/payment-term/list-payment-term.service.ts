import { AppError } from '@/helpers/app-error'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const listPaymentTermsService = async () => {
   const paymentTerms = await prisma.paymentTerms.findMany({
      orderBy: {
         installments: 'asc',
      },
   })

   if (!paymentTerms || paymentTerms.length === 0) {
      throw new AppError('Nenhuma condição de pagamento encontrada', 404)
   }

   return paymentTerms
}
