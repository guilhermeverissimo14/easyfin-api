import { AppError } from '@/helpers/app-error'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const updatePaymentTermService = async (
   id: string,
   paymentTermData: {
      description?: string
      tax?: number
      term?: number
   },
) => {
   const paymentTerm = await prisma.paymentTerms.findUnique({
      where: {
         id,
      },
   })

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
