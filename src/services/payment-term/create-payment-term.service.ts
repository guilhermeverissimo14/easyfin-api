import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createPaymentTermService = async (paymentTermData: { description: string; tax?: number; term: number }) => {
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
