import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

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
