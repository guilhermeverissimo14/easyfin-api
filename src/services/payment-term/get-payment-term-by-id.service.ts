import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

export const getPaymentTermByIdService = async (id: string) => {
   const paymentTerm = await prisma.paymentTerms.findUnique({
      where: {
         id,
      },
   })

   if (!paymentTerm) {
      throw new AppError('Condição de pagamento não encontrada', 404)
   }

   return paymentTerm
}
