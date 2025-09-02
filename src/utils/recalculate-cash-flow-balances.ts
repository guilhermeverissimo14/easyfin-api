import { TransactionType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

/**
 * Recalcula os saldos do fluxo de caixa para uma conta bancária específica
 * ordenando por data e recalculando sequencialmente
 */
export const recalculateCashFlowBalances = async (bankAccountId: string) => {
   // Busca todos os lançamentos da conta bancária ordenados por data
   const cashFlowEntries = await prisma.cashFlow.findMany({
      where: {
         bankAccountId,
      },
      orderBy: [
         { date: 'asc' },
         { createdAt: 'asc' } // Em caso de mesma data, ordena por criação
      ],
   })

   let currentBalance = 0

   if (cashFlowEntries.length === 0) {
      return currentBalance
   }

   // Recalcula o saldo sequencialmente
   for (const entry of cashFlowEntries) {
      if (entry.type === TransactionType.CREDIT) {
         currentBalance += entry.value
      } else {
         currentBalance -= entry.value
      }

      // Atualiza o saldo no banco
      await prisma.cashFlow.update({
         where: { id: entry.id },
         data: { balance: currentBalance },
      })
   }

   return currentBalance
}

/**
 * Recalcula os saldos do fluxo de caixa para um caixa específico
 */
export const recalculateCashBoxFlowBalances = async (cashBoxId: string) => {
   const cashFlowEntries = await prisma.cashFlow.findMany({
      where: {
         cashBoxId,
      },
      orderBy: [
         { date: 'asc' },
         { createdAt: 'asc' }
      ],
   })

   let currentBalance = 0

   for (const entry of cashFlowEntries) {
      if (entry.type === TransactionType.CREDIT) {
         currentBalance += entry.value
      } else {
         currentBalance -= entry.value
      }

      await prisma.cashFlow.update({
         where: { id: entry.id },
         data: { balance: currentBalance },
      })
   }

   return currentBalance
}