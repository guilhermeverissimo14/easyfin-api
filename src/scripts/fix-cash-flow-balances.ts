import { PrismaClient, TransactionType } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Script para corrigir os saldos do fluxo de caixa existentes
 * Recalcula todos os saldos ordenando por data
 */
async function fixCashFlowBalances() {
   console.log('🔧 Iniciando correção dos saldos do fluxo de caixa...')

   try {
      // Busca todas as contas bancárias que têm lançamentos no fluxo de caixa
      const bankAccountsWithCashFlow = await prisma.cashFlow.findMany({
         where: {
            bankAccountId: { not: null },
         },
         select: {
            bankAccountId: true,
         },
         distinct: ['bankAccountId'],
      })

      console.log(`📊 Encontradas ${bankAccountsWithCashFlow.length} contas bancárias com lançamentos`)

      // Corrige cada conta bancária
      for (const account of bankAccountsWithCashFlow) {
         if (account.bankAccountId) {
            console.log(`🏦 Corrigindo conta bancária: ${account.bankAccountId}`)
            await fixAccountCashFlow(account.bankAccountId)
         }
      }

      // Busca todos os caixas que têm lançamentos no fluxo de caixa
      const cashBoxesWithCashFlow = await prisma.cashFlow.findMany({
         where: {
            cashBoxId: { not: null },
         },
         select: {
            cashBoxId: true,
         },
         distinct: ['cashBoxId'],
      })

      console.log(`💰 Encontrados ${cashBoxesWithCashFlow.length} caixas com lançamentos`)

      // Corrige cada caixa
      for (const cashBox of cashBoxesWithCashFlow) {
         if (cashBox.cashBoxId) {
            console.log(`💰 Corrigindo caixa: ${cashBox.cashBoxId}`)
            await fixCashBoxCashFlow(cashBox.cashBoxId)
         }
      }

      console.log('✅ Correção dos saldos concluída com sucesso!')
   } catch (error) {
      console.error('❌ Erro ao corrigir saldos:', error)
   } finally {
      await prisma.$disconnect()
   }
}

/**
 * Corrige os saldos de uma conta bancária específica
 */
async function fixAccountCashFlow(bankAccountId: string) {
   const entries = await prisma.cashFlow.findMany({
      where: { bankAccountId },
      orderBy: [
         { date: 'asc' },
         { createdAt: 'asc' }
      ],
   })

   let balance = 0
   let updatedCount = 0

   for (const entry of entries) {
      const oldBalance = entry.balance
      balance = entry.type === TransactionType.CREDIT ? balance + entry.value : balance - entry.value
      
      if (oldBalance !== balance) {
         await prisma.cashFlow.update({
            where: { id: entry.id },
            data: { balance },
         })
         updatedCount++
      }
   }

   console.log(`   📝 ${updatedCount} lançamentos atualizados. Saldo final: ${balance / 100}`)
}

/**
 * Corrige os saldos de um caixa específico
 */
async function fixCashBoxCashFlow(cashBoxId: string) {
   const entries = await prisma.cashFlow.findMany({
      where: { cashBoxId },
      orderBy: [
         { date: 'asc' },
         { createdAt: 'asc' }
      ],
   })

   let balance = 0
   let updatedCount = 0

   for (const entry of entries) {
      const oldBalance = entry.balance
      balance = entry.type === TransactionType.CREDIT ? balance + entry.value : balance - entry.value
      
      if (oldBalance !== balance) {
         await prisma.cashFlow.update({
            where: { id: entry.id },
            data: { balance },
         })
         updatedCount++
      }
   }

   console.log(`   📝 ${updatedCount} lançamentos atualizados. Saldo final: ${balance / 100}`)
}

// Executa o script se for chamado diretamente
if (require.main === module) {
   fixCashFlowBalances()
}

export { fixCashFlowBalances }