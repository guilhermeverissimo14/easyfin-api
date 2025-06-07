import { PrismaClient } from '@prisma/client'
import { AppError } from '@/helpers/app-error'

const prisma = new PrismaClient()

export const listCashFlowByAccountIdService = async (bankAccountId: string) => {
   try {
      const bankAccount = await prisma.bankAccounts.findUnique({
         where: {
            id: bankAccountId,
         },
      })

      if (!bankAccount) {
         throw new AppError('Conta bancária não encontrada', 404)
      }

      const cashFlowList = await prisma.cashFlow.findMany({
         where: {
            bankAccountId,
         },
         include: {
            CostCenter: true,
         },
         orderBy: {
            date: 'desc',
         },
      })

      return cashFlowList.map((cashFlow) => ({
         ...cashFlow,
         value: cashFlow.value / 100,
         balance: cashFlow.balance / 100,
         date: cashFlow.date.toISOString(),
         costCenter: {
            id: cashFlow.CostCenter?.id,
            name: cashFlow.CostCenter?.name,
         },
      }))
   } catch (error) {
      if (error instanceof AppError) {
         throw error
      }
      throw new AppError('Erro ao listar lançamentos do fluxo de caixa por conta bancária', 500)
   }
}
