import { PrismaClient } from '@prisma/client'
import { AppError } from '@/helpers/app-error'

const prisma = new PrismaClient()

export const listCashFlowByCashBoxIdService = async () => {
   try {
      const cash = await prisma.cashBox.findFirst()
      if (!cash) {
         throw new AppError('Nenhum caixa encontrado', 404)
      }
      const cashBoxId = cash.id

      const cashBox = await prisma.cashBox.findUnique({
         where: {
            id: cashBoxId,
         },
      })

      if (!cashBox) {
         throw new AppError('Caixa não encontrado', 404)
      }

      const cashFlowList = await prisma.cashFlow.findMany({
         where: {
            cashBoxId,
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
      throw new AppError('Erro ao listar lançamentos do fluxo de caixa por caixa', 500)
   }
}
