import { PaymentStatus, TransactionType } from '@prisma/client'
import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

export const deleteAccountReceivableService = async (id: string) => {
   const account = await prisma.accountsReceivable.findUnique({
      where: {
         id,
      },
   })

   if (!account) {
      throw new AppError('Conta a receber não encontrada', 404)
   }

   if (account.totalInstallments && account.totalInstallments > 0) {
      const receivedInstallments = await prisma.accountsReceivable.count({
         where: {
            customerId: account.customerId,
            documentNumber: account.documentNumber,
            status: PaymentStatus.PAID,
         },
      })

      if (receivedInstallments > 0) {
         throw new AppError('Não é possível excluir esta parcela, pois faz parte de um plano de parcelamento e já existem parcelas recebidas.', 400)
      }

      if (account.installmentNumber && account.installmentNumber > 1) {
         throw new AppError(
            'Não é possível excluir esta parcela, pois faz parte de um plano de parcelamento. Exclua ou Edite a ultima parcela para prosseguir.',
            400,
         )
      }
   }

   try {
      if (account.status === PaymentStatus.PAID) {
         throw new AppError('Não é possível excluir uma conta a receber paga.', 400)
      }

      const accountValue = account!.value || 0
      
      const cashFlowEntry = await prisma.cashFlow.findFirst({
         where: {
            documentNumber: account.documentNumber,
            type: TransactionType.CREDIT,
            value: accountValue
         },
         orderBy: { createdAt: 'desc' },
      })

      if (cashFlowEntry) {
         await prisma.cashFlow.delete({
            where: { id: cashFlowEntry.id },
         });
      }

      await prisma.accountsReceivable.delete({
         where: {
            id,
         },
      })
   } catch (error) {
      throw new AppError('Erro ao remover conta a receber', 500)
   }
}
