import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'
import { recalculateCashFlowBalancesFromDate, recalculateCashBoxFlowBalancesFromDate } from '@/utils/recalculate-cash-flow-balances'

export const deleteCashFlowService = async (cashFlowId: string) => {
   try {
      return await prisma.$transaction(async (prisma) => {
         const cashFlow = await prisma.cashFlow.findUnique({
            where: { id: cashFlowId },
         })

         if (!cashFlow) {
            throw new AppError('Lançamento do fluxo de caixa não encontrado', 404)
         }

         console.log('Iniciando remoção do lançamento do fluxo de caixa. Linha encontrada: ', cashFlow)

         const { bankAccountId, cashBoxId, value, type, csvFileName, date } = cashFlow

         // Se for lançamento de conta bancária
         if (bankAccountId) {
            if (csvFileName) {
               // Lançamento de importação bancária - buscar pela data e csvFileName
               const bankTransaction = await prisma.bankTransactions.findFirst({
                  where: {
                     bankAccountId,
                     csvFileName,
                     amount: value,
                     type,
                     transactionAt: {
                        gte: new Date(cashFlow.date.getTime() - 24 * 60 * 60 * 1000), // 1 dia antes
                        lte: new Date(cashFlow.date.getTime() + 24 * 60 * 60 * 1000), // 1 dia depois
                     },
                  },
                  orderBy: { createdAt: 'desc' },
               })

               // Deletar a transação bancária de importação
               if (bankTransaction) {
                  await prisma.bankTransactions.delete({
                     where: { id: bankTransaction.id },
                  })
               }
            } else {
               console.log('Removendo lançamento manual de conta bancária')
               const bankTransactions = await prisma.bankTransactions.findMany({
                  where: {
                     bankAccountId,
                     amount: value,
                     type,
                     description: 'Lançamento manual de fluxo de caixa',
                     transactionAt: {
                        gte: new Date(cashFlow.createdAt.getTime() - 60000),
                        lte: new Date(cashFlow.createdAt.getTime() + 60000),
                     },
                  },
                  orderBy: { createdAt: 'desc' },
                  take: 1,
               })

               console.log('Transações bancárias encontradas: ', bankTransactions)

               // Deletar a transação bancária manual relacionada
               if (bankTransactions.length > 0) {
                  await prisma.bankTransactions.delete({
                     where: { id: bankTransactions[0].id },
                  })
               }
            }

            // Reverter o saldo bancário
            const bankBalance = await prisma.bankBalance.findFirst({
               where: { bankAccountId },
            })

            console.log('Saldo bancário encontrado: ', bankBalance)

            if (bankBalance) {
               const adjustmentValue = type === 'CREDIT' ? -value : value
               await prisma.bankBalance.update({
                  where: { id: bankBalance.id },
                  data: {
                     balance: bankBalance.balance + adjustmentValue,
                  },
               })
            }
         }

         // Se for lançamento de caixa
         if (cashBoxId) {
            // Buscar transações de caixa criadas na mesma data/valor
            const cashTransactions = await prisma.cashTransaction.findMany({
               where: {
                  cashBoxId,
                  amount: value,
                  type,
                  description: 'Lançamento manual de fluxo de caixa',
                  transactionAt: {
                     gte: new Date(cashFlow.createdAt.getTime() - 60000), // 1 minuto antes
                     lte: new Date(cashFlow.createdAt.getTime() + 60000), // 1 minuto depois
                  },
               },
               orderBy: { createdAt: 'desc' },
               take: 1,
            })

            // Deletar a transação de caixa relacionada
            if (cashTransactions.length > 0) {
               await prisma.cashTransaction.delete({
                  where: { id: cashTransactions[0].id },
               })
            }

            // Reverter o saldo do caixa
            const adjustmentValue = type === 'CREDIT' ? -value : value
            await prisma.cashBox.update({
               where: { id: cashBoxId },
               data: {
                  balance: {
                     increment: adjustmentValue,
                  },
               },
            })
         }

         console.log('Removendo lançamento do fluxo de caixa')
         // Deletar o lançamento do fluxo de caixa
         await prisma.cashFlow.delete({
            where: { id: cashFlowId },
         })
         console.log('Lançamento do fluxo de caixa removido com sucesso')

         // OTIMIZAÇÃO: Recalcular saldos apenas a partir da data do lançamento removido
         if (bankAccountId) {
            console.log('Recalculando saldos bancários a partir da data do lançamento removido...')
            console.log({ bankAccountId, date })
            // Adicionando 1 milissegundo para evitar incluir lançamentos da mesma data/hora
            const recalcDate = new Date(date.getTime() + 1)
            await recalculateCashFlowBalancesFromDate(bankAccountId, recalcDate)
         }

         if (cashBoxId) {
            const recalcDate = new Date(date.getTime() + 1)
            await recalculateCashBoxFlowBalancesFromDate(cashBoxId, recalcDate)
         }

         return {
            message: 'Lançamento removido com sucesso',
            deletedCashFlowId: cashFlowId,
         }
      })
   } catch (error) {
      if (error instanceof AppError) {
         throw error
      }
      throw new AppError('Erro interno do servidor ao remover lançamento', 500)
   }
}
