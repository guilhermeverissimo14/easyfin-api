import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

export const updatePaymentTermService = async (
   id: string,
   paymentTermData: {
      paymentMethodId?: string
      condition?: string
      description?: string
      installments?: number
   },
) => {
   const paymentTerm = await prisma.paymentTerms.findUnique({
      where: {
         id,
      },
   })

   if (paymentTermData.condition && paymentTermData.installments) {
      const conditionParts = paymentTermData.condition.split(',').map((part) => part.trim())

      if (conditionParts.length !== paymentTermData.installments) {
         throw new AppError('Número de parcelas deve corresponder ao número de condições', 400)
      }
   }

   if (!paymentTerm) {
      throw new AppError('Condição de pagamento não encontrada', 404)
   }

   const updatedPaymentTerm = await prisma.paymentTerms.update({
      where: {
         id,
      },
      data: {
         ...paymentTermData,
      },
   })

   return updatedPaymentTerm
}
