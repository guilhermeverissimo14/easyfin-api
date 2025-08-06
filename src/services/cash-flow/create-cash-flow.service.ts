import { PrismaClient, TransactionType } from '@prisma/client'
import { AppError } from '@/helpers/app-error'

const prisma = new PrismaClient()

// Função auxiliar para recalcular saldos de conta bancária
const recalculateBalancesForAccount = async (prisma: any, bankAccountId: string) => {
   const entries = await prisma.cashFlow.findMany({
      where: { bankAccountId },
      orderBy: [
         { date: 'asc' },
         { createdAt: 'asc' }
      ],
   })

   let balance = 0
   for (const entry of entries) {
      balance = entry.type === TransactionType.CREDIT ? balance + entry.value : balance - entry.value
      await prisma.cashFlow.update({
         where: { id: entry.id },
         data: { balance },
      })
   }
}

// Função auxiliar para recalcular saldos de caixa
const recalculateBalancesForCashBox = async (prisma: any, cashBoxId: string) => {
   const entries = await prisma.cashFlow.findMany({
      where: { cashBoxId },
      orderBy: [
         { date: 'asc' },
         { createdAt: 'asc' }
      ],
   })

   let balance = 0
   for (const entry of entries) {
      balance = entry.type === TransactionType.CREDIT ? balance + entry.value : balance - entry.value
      await prisma.cashFlow.update({
         where: { id: entry.id },
         data: { balance },
      })
   }
}

export const createCashFlowService = async (data: {
   date: string
   historic: string
   type: TransactionType
   description?: string
   value: number
   costCenterId?: string
   bankAccountId?: string
   cashBoxId?: string
}) => {
   const { date, historic, type, description, value, costCenterId, bankAccountId, cashBoxId } = data

   if (!bankAccountId && !cashBoxId) {
      throw new AppError('É necessário informar uma conta bancária ou um caixa', 400)
   }

   if (bankAccountId && cashBoxId) {
      throw new AppError('Informe apenas um: conta bancária ou caixa', 400)
   }

   try {
      return await prisma.$transaction(async (prisma) => {
         let lastBalance = 0

         if (bankAccountId) {
            const bankAccount = await prisma.bankAccounts.findUnique({ where: { id: bankAccountId } })

            if (!bankAccount) {
               throw new AppError('Conta bancária não encontrada', 404)
            }

            await prisma.bankTransactions.create({
               data: {
                  bankAccountId: bankAccount.id,
                  type: type,
                  description: 'Lançamento manual de fluxo de caixa',
                  detailing: historic,
                  amount: value * 100,
                  transactionAt: new Date(),
               },
            })

            // O saldo será recalculado após a criação do lançamento
            lastBalance = 0

            await prisma.bankBalance.updateMany({
               where: {
                  bankAccountId,
               },
               data: {
                  balance: type === TransactionType.CREDIT ? { increment: value * 100 } : { decrement: value * 100 },
               },
            })
         }

         if (cashBoxId) {
            const cashBox = await prisma.cashBox.findUnique({ where: { id: cashBoxId } })

            if (!cashBox) {
               throw new AppError('Caixa não encontrado', 404)
            }

            await prisma.cashTransaction.create({
               data: {
                  cashBoxId: cashBox.id,
                  type: type,
                  description: historic ? historic : 'Lançamento manual de fluxo de caixa',
                  amount: value * 100,
                  transactionAt: new Date(),
               },
            })

            // O saldo será recalculado após a criação do lançamento
            lastBalance = 0

            await prisma.cashBox.update({
               where: {
                  id: cashBoxId,
               },
               data: {
                  balance: type === TransactionType.CREDIT ? { increment: value * 100 } : { decrement: value * 100 },
               },
            })
         }

         const cashFlow = await prisma.cashFlow.create({
            data: {
               date: new Date(date),
               historic,
               type,
               description,
               value: value * 100,
               costCenterId,
               bankAccountId,
               cashBoxId,
               balance: 0, // Será recalculado
            },
         })

         // Recalcula todos os saldos da conta/caixa ordenando por data
         if (bankAccountId) {
            await recalculateBalancesForAccount(prisma, bankAccountId)
         }
         
         if (cashBoxId) {
            await recalculateBalancesForCashBox(prisma, cashBoxId)
         }

         // Busca o lançamento atualizado com o saldo correto
         const updatedCashFlow = await prisma.cashFlow.findUnique({
            where: { id: cashFlow.id },
         })

         return {
            ...updatedCashFlow!,
            value: updatedCashFlow!.value / 100,
            date: updatedCashFlow!.date.toISOString(),
         }
      })
   } catch (error: any) {
      if (error instanceof AppError) {
         throw error
      }
      throw new AppError('Erro ao criar lançamento no fluxo de caixa', 500)
   }
}
