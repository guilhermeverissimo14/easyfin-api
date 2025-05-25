import { AppError } from '@/helpers/app-error'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const listPaymentMethodsService = async () => {
   const paymentMethods = await prisma.paymentMethod.findMany({
      orderBy: {
         name: 'asc',
      },
   })

   if (!paymentMethods || paymentMethods.length === 0) {
      throw new AppError('Nenhuma forma de pagamento encontrada', 404)
   }

   return paymentMethods
}
