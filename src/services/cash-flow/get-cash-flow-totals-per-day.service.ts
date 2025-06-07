import { PrismaClient, TransactionType } from '@prisma/client'
import { AppError } from '@/helpers/app-error'

const prisma = new PrismaClient()

export const getCashFlowTotalsPerDayService = async ({ bankAccountId, cashId, date }: { bankAccountId?: string; cashId?: string; date: Date }) => {
   if (!bankAccountId && !cashId) {
      throw new AppError('É necessário informar um bankAccountId ou um cashId', 400)
   }

   if (bankAccountId && cashId) {
      throw new AppError('Informe apenas um: bankAccountId ou cashId', 400)
   }

   const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
   const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)

   try {
      if (bankAccountId) {
         const bankAccount = await prisma.bankAccounts.findUnique({
            where: {
               id: bankAccountId,
            },
         })

         if (!bankAccount) {
            throw new AppError('Conta bancária não encontrada', 404)
         }

         const totalEntries = await prisma.cashFlow.aggregate({
            where: {
               bankAccountId,
               date: {
                  gte: startOfDay,
                  lt: endOfDay,
               },
               type: TransactionType.CREDIT,
            },
            _sum: {
               value: true,
            },
         })

         const totalExits = await prisma.cashFlow.aggregate({
            where: {
               bankAccountId,
               date: {
                  gte: startOfDay,
                  lt: endOfDay,
               },
               type: TransactionType.DEBIT,
            },
            _sum: {
               value: true,
            },
         })

         const bankBalance = await prisma.bankBalance.findFirst({
            where: {
               bankAccountId,
            },
            orderBy: {
               createdAt: 'desc',
            },
         })

         const day = String(date.getDate()).padStart(2, '0')
         const month = String(date.getMonth() + 1).padStart(2, '0')
         const year = date.getFullYear()
         const formattedDate = `${day}/${month}/${year}`

         return {
            date: formattedDate,
            bankName: bankAccount.bank,
            bankAccountInfo: `Ag. ${bankAccount.agency} - CC ${bankAccount.account}`,
            totalEntries: (totalEntries._sum.value || 0) / 100,
            totalExits: (totalExits._sum.value || 0) / 100,
            balance: (bankBalance?.balance || 0) / 100,
         }
      }

      if (cashId) {
         const cashBox = await prisma.cashBox.findUnique({
            where: {
               id: cashId,
            },
         })

         if (!cashBox) {
            throw new AppError('Caixa não encontrado', 404)
         }

         const totalEntries = await prisma.cashFlow.aggregate({
            where: {
               cashBoxId: cashId,
               date: {
                  gte: startOfDay,
                  lt: endOfDay,
               },
               type: TransactionType.CREDIT,
            },
            _sum: {
               value: true,
            },
         })

         const totalExits = await prisma.cashFlow.aggregate({
            where: {
               cashBoxId: cashId,
               date: {
                  gte: startOfDay,
                  lt: endOfDay,
               },
               type: TransactionType.DEBIT,
            },
            _sum: {
               value: true,
            },
         })

         const day = String(date.getDate()).padStart(2, '0')
         const month = String(date.getMonth() + 1).padStart(2, '0')
         const year = date.getFullYear()
         const formattedDate = `${day}/${month}/${year}`

         return {
            date: formattedDate,
            bankName: cashBox.name,
            bankAccountInfo: `Apenas dinheiro`,
            totalEntries: (totalEntries._sum.value || 0) / 100,
            totalExits: (totalExits._sum.value || 0) / 100,
            balance: cashBox.balance / 100,
         }
      }
   } catch (error) {
      if (error instanceof AppError) {
         throw error
      }
      throw new AppError('Erro ao obter totais do fluxo de caixa por dia', 500)
   }
}
