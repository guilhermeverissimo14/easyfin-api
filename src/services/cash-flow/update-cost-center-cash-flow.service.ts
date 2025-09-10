import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

export const updateCostCenterCashFlowService = async (data: { cashFlowId: string; costCenterId?: string }) => {
   const { cashFlowId, costCenterId } = data

   try {
      return await prisma.$transaction(async (prisma) => {
         const cashFlow = await prisma.cashFlow.findUnique({
            where: { id: cashFlowId },
         })

         if (!cashFlow) {
            throw new AppError('Lançamento do fluxo de caixa não encontrado', 404)
         }

         if (costCenterId) {
            const costCenter = await prisma.costCenter.findUnique({
               where: { id: costCenterId },
            })

            if (!costCenter) {
               throw new AppError('Centro de custo não encontrado', 404)
            }
         }

         const updatedCashFlow = await prisma.cashFlow.update({
            where: { id: cashFlowId },
            data: {
               costCenterId: costCenterId || null,
            },
            include: {
               CostCenter: {
                  select: {
                     id: true,
                     name: true,
                  },
               },
            },
         })

         return updatedCashFlow
      })
   } catch (error) {
      if (error instanceof AppError) {
         throw error
      }
      throw new AppError('Erro interno do servidor', 500)
   }
}
