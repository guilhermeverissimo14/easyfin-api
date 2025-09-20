import { prisma } from '@/lib/prisma'

interface MonthlyData {
   month: number
   monthName: string
   costCenters: {
      id: string
      name: string
      balance: number
   }[]
}

interface CostCenterAnalysis {
   year: number
   type: 'C' | 'D' | 'ALL'
   months: MonthlyData[]
}

interface GetCostCenterAnalysisParams {
   type?: 'C' | 'D'
   year: number
}

const monthNames = [
   'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export async function getCostCenterAnalysisService(
   params: GetCostCenterAnalysisParams
): Promise<CostCenterAnalysis> {
   const { type, year } = params
   
   const costCenters = await prisma.costCenter.findMany({
      select: {
         id: true,
         name: true
      },
      orderBy: {
         name: 'asc'
      }
   })

   // Adicionar uma entrada especial para registros sem centro de custo
   const costCentersWithEmpty = [
      ...costCenters,
      {
         id: 'empty',
         name: 'Sem Centro de Custo'
      }
   ]

   // Processar meses em lotes menores para reduzir conexões simultâneas
   const months: MonthlyData[] = []
   const batchSize = 3 // Processar 3 meses por vez
   
   for (let i = 1; i <= 12; i += batchSize) {
      const monthBatch = []
      
      for (let month = i; month < Math.min(i + batchSize, 13); month++) {
         const startOfMonth = new Date(year, month - 1, 1)
         const endOfMonth = new Date(year, month, 0, 23, 59, 59)

         const costCenterBalances = await Promise.all(
            costCentersWithEmpty.map(async (costCenter) => {
               let balance = 0

               let cashFlowConditions: any = {
                  date: {
                     gte: startOfMonth,
                     lte: endOfMonth
                  }
               }

               let accountsPayableConditions: any = {
                  status: 'PAID',
                  paymentDate: {
                     gte: startOfMonth,
                     lte: endOfMonth
                  }
               }

               let accountsReceivableConditions: any = {
                  status: 'PAID',
                  receiptDate: {
                     gte: startOfMonth,
                     lte: endOfMonth
                  }
               }

               // Configurar filtros baseado no tipo de centro de custo
               if (costCenter.id === 'empty') {
                  // Filtrar registros sem centro de custo
                  cashFlowConditions.OR = [
                     { costCenterId: null },
                     { costCenterId: '' }
                  ]
                  accountsPayableConditions.OR = [
                     { costCenterId: null },
                     { costCenterId: '' }
                  ]
                  accountsReceivableConditions.OR = [
                     { costCenterId: null },
                     { costCenterId: '' }
                  ]
               } else {
                  // Filtrar registros com centro de custo específico
                  cashFlowConditions.costCenterId = costCenter.id
                  accountsPayableConditions.costCenterId = costCenter.id
                  accountsReceivableConditions.costCenterId = costCenter.id
               }

               if (type) {
                  const transactionType = type === 'C' ? 'CREDIT' : 'DEBIT'
                  cashFlowConditions.type = transactionType
               }

               const [cashFlowEntries, cashFlowDebits, accountsPayable, accountsReceivable] = await Promise.all([
                  prisma.cashFlow.aggregate({
                     where: {
                        ...cashFlowConditions,
                        type: 'CREDIT'
                     },
                     _sum: { value: true }
                  }),
                  prisma.cashFlow.aggregate({
                     where: {
                        ...cashFlowConditions,
                        type: 'DEBIT'
                     },
                     _sum: { value: true }
                  }),
                  prisma.accountsPayable.aggregate({
                     where: accountsPayableConditions,
                     _sum: { paidValue: true }
                  }),
                  prisma.accountsReceivable.aggregate({
                     where: accountsReceivableConditions,
                     _sum: { receivedValue: true }
                  })
               ])

               if (!type || type === 'C') {
                  balance += (cashFlowEntries._sum?.value || 0)
                  balance += (accountsReceivable._sum?.receivedValue || 0)
               }

               if (!type || type === 'D') {
                  balance -= (cashFlowDebits._sum?.value || 0)
                  balance -= (accountsPayable._sum?.paidValue || 0)
               }

               if (type === 'C') {
                  balance = (cashFlowEntries._sum?.value || 0) + (accountsReceivable._sum?.receivedValue || 0)
               } else if (type === 'D') {
                  balance = -((cashFlowDebits._sum?.value || 0) + (accountsPayable._sum?.paidValue || 0))
               }

               return {
                  id: costCenter.id,
                  name: costCenter.name,
                  balance: balance / 100
               }
            })
         )

         monthBatch.push({
            month,
            monthName: monthNames[month - 1],
            costCenters: costCenterBalances
         })
      }
      
      const batchResults = await Promise.all(monthBatch)
      months.push(...batchResults)
   }

   return {
      year,
      type: type || 'ALL',
      months
   }
}