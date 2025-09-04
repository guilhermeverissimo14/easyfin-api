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

   const months: MonthlyData[] = []

   for (let month = 1; month <= 12; month++) {
      const startOfMonth = new Date(year, month - 1, 1)
      const endOfMonth = new Date(year, month, 0, 23, 59, 59)

      const costCenterBalances = await Promise.all(
         costCenters.map(async (costCenter) => {
            let balance = 0

            const cashFlowConditions: any = {
               costCenterId: costCenter.id,
               date: {
                  gte: startOfMonth,
                  lte: endOfMonth
               }
            }

            const accountsPayableConditions: any = {
               costCenterId: costCenter.id,
               status: 'PAID',
               paymentDate: {
                  gte: startOfMonth,
                  lte: endOfMonth
               }
            }

            const accountsReceivableConditions: any = {
               costCenterId: costCenter.id,
               status: 'PAID',
               receiptDate: {
                  gte: startOfMonth,
                  lte: endOfMonth
               }
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
               balance += (cashFlowDebits._sum?.value || 0)
               balance += (accountsPayable._sum?.paidValue || 0)
            }

            if (type === 'C') {
               balance = (cashFlowEntries._sum?.value || 0) + (accountsReceivable._sum?.receivedValue || 0)
            } else if (type === 'D') {
               balance = (cashFlowDebits._sum?.value || 0) + (accountsPayable._sum?.paidValue || 0)
            }

            return {
               id: costCenter.id,
               name: costCenter.name,
               balance: balance / 100
            }
         })
      )

      months.push({
         month,
         monthName: monthNames[month - 1],
         costCenters: costCenterBalances
      })
   }

   return {
      year,
      type: type || 'ALL',
      months
   }
}