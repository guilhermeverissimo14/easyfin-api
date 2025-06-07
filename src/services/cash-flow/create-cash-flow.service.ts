import { PrismaClient, TransactionType } from '@prisma/client'
import { AppError } from '@/helpers/app-error'

const prisma = new PrismaClient()

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

            const lastCashFlow = await prisma.cashFlow.findFirst({
               where: {
                  bankAccountId,
               },
               orderBy: {
                  date: 'desc',
               },
            })

            lastBalance = lastCashFlow?.balance || 0

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

            const lastCashFlow = await prisma.cashFlow.findFirst({
               where: {
                  cashBoxId,
               },
               orderBy: {
                  date: 'desc',
               },
            })

            await prisma.cashTransaction.create({
               data: {
                  cashBoxId: cashBox.id,
                  type: type,
                  description: historic ? historic : 'Lançamento manual de fluxo de caixa',
                  amount: value * 100,
                  transactionAt: new Date(),
               },
            })

            lastBalance = lastCashFlow?.balance || 0

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
               balance: type === TransactionType.CREDIT ? lastBalance + value * 100 : lastBalance - value * 100,
            },
         })

         return {
            ...cashFlow,
            value: cashFlow.value / 100,
            date: cashFlow.date.toISOString(),
         }
      })
   } catch (error: any) {
      if (error instanceof AppError) {
         throw error
      }
      throw new AppError('Erro ao criar lançamento no fluxo de caixa', 500)
   }
}
