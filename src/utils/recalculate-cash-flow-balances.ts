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
         { createdAt: 'asc' }, // Em caso de mesma data, ordena por criação
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
 * Recalcula os saldos do fluxo de caixa a partir de uma data específica
 * Otimizado para recálculos parciais após remoções
 */
export const recalculateCashFlowBalancesFromDate = async (bankAccountId: string, fromDate: Date) => {
   // Busca o último saldo antes da data de início
   const lastEntryBeforeDate = await prisma.cashFlow.findFirst({
      where: {
         bankAccountId,
         date: {
            lt: fromDate,
         },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
   })

   console.log('Saldo inicial antes do recálculo: ', lastEntryBeforeDate?.balance)

   // Saldo inicial é o último saldo antes da data ou 0
   let currentBalance = lastEntryBeforeDate?.balance || 0

   // Busca apenas os lançamentos a partir da data especificada
   const cashFlowEntries = await prisma.cashFlow.findMany({
      where: {
         bankAccountId,
         date: {
            gte: fromDate,
         },
      },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
   })

   console.log('Lançamentos a serem recalculados: ', cashFlowEntries.length)

   // Recalcula apenas os saldos necessários
   for (const entry of cashFlowEntries) {
      if (entry.type === TransactionType.CREDIT) {
         currentBalance += entry.value
         console.log('Crédito: ', entry.value)
      } else {
         currentBalance -= entry.value
         console.log('Débito: ', entry.value)
      }

      console.log('Saldo atual: ', currentBalance)
      console.log('--------------------------')
      console.log('Atualizando o saldo no banco de dados para o lançamento: ', entry.id)
      console.log('--------------------------')
      await prisma.cashFlow.update({
         where: { id: entry.id },
         data: { balance: currentBalance },
      })
   }

   console.log('Saldo final após recálculo: ', currentBalance)
   console.log('--------------------------')

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
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
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

/**
 * Recalcula os saldos do fluxo de caixa para um caixa a partir de uma data específica
 */
export const recalculateCashBoxFlowBalancesFromDate = async (cashBoxId: string, fromDate: Date) => {
   // Busca o último saldo antes da data de início
   const lastEntryBeforeDate = await prisma.cashFlow.findFirst({
      where: {
         cashBoxId,
         date: {
            lt: fromDate,
         },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
   })

   let currentBalance = lastEntryBeforeDate?.balance || 0

   // Busca apenas os lançamentos a partir da data especificada
   const cashFlowEntries = await prisma.cashFlow.findMany({
      where: {
         cashBoxId,
         date: {
            gte: fromDate,
         },
      },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
   })

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
