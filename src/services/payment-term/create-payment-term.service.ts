import { prisma } from '@/lib/prisma'

export const createPaymentTermService = async (paymentTermData: {
   paymentMethodId: string
   condition: string
   description?: string
   installments?: number
}) => {
   try {
      const paymentTerm = await prisma.paymentTerms.create({
         data: {
            ...paymentTermData,
         },
      })

      return paymentTerm
   } catch (error) {
      console.error(error)
      throw new Error('Erro ao criar a condição de pagamento')
   }
}
