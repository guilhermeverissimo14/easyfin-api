import { AppError } from '@/helpers/app-error'
import { UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const deletePaymentTermService = async (id: string, userRole: string) => {
   if (userRole !== UserRole.ADMIN) {
      throw new AppError('Acesso negado', 403)
   }

   const paymentTerm = await prisma.paymentTerms.findUnique({
      where: {
         id,
      },
   })

   if (!paymentTerm) {
      throw new AppError('Condição de pagamento não encontrada', 404)
   }

   try {
      await prisma.paymentTerms.delete({
         where: {
            id,
         },
      })
   } catch (error) {
      console.error(error)
      throw new Error('Erro ao deletar a condição de pagamento')
   }
   return { message: 'Condição de pagamento removida com sucesso' }
}
