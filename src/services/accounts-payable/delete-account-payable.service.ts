import { PaymentStatus } from '@prisma/client'
import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

export const deleteAccountPayableService = async (id: string) => {
   const account = await prisma.accountsPayable.findUnique({
      where: {
         id,
      },
   })

   if (!account) {
      throw new AppError('Conta a pagar não encontrada', 404)
   }

   if (account.totalInstallments && account.totalInstallments > 0) {
      const paidInstallments = await prisma.accountsPayable.count({
         where: {
            supplierId: account.supplierId,
            documentNumber: account.documentNumber,
            status: PaymentStatus.PAID,
         },
      })

      if (paidInstallments > 0) {
         throw new AppError('Não é possível excluir esta parcela, pois faz parte de um plano de parcelamento e já existem parcelas pagas.', 400)
      }

      if (account.installmentNumber && account.installmentNumber > 1) {
         throw new AppError(
            'Não é possível excluir esta parcela, pois faz parte de um plano de parcelamento. Exclua ou Edite a ultima parcela para prosseguir.',
            400,
         )
      }
   }

   try {
      await prisma.accountsPayable.delete({
         where: {
            id,
         },
      })
   } catch (error) {
      throw new AppError('Erro ao remover conta a pagar', 500)
   }
}
