import { prisma } from '@/lib/prisma'
import { getTodayInBrazilTimezone } from '@/utils/format'

interface ChartFilters {
   period: 'week' | 'month' | 'quarter' | 'year'
   startDate?: Date
   endDate?: Date
}

interface ChartData {
   label: string
   value: number
   date?: string
}

interface DashboardCharts {
   accountsPayableChart: ChartData[]
   accountsReceivableChart: ChartData[]
   cashFlowChart: ChartData[]
   monthlyComparisonChart: {
      revenue: ChartData[]
      expenses: ChartData[]
   }
   paymentStatusChart: {
      paid: number
      pending: number
      overdue: number
   }
   topCostCenters: ChartData[]
}

function getDateRange(period: string, startDate?: Date, endDate?: Date) {
   const today = getTodayInBrazilTimezone()

   if (startDate && endDate) {
      return { start: startDate, end: endDate }
   }

   switch (period) {
      case 'week':
         const weekStart = new Date(today)
         weekStart.setDate(today.getDate() - 7)
         return { start: weekStart, end: today }

      case 'month':
         const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
         return { start: monthStart, end: today }

      case 'quarter':
         const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)
         return { start: quarterStart, end: today }

      case 'year':
         const yearStart = new Date(today.getFullYear(), 0, 1)
         return { start: yearStart, end: today }

      default:
         const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1)
         return { start: defaultStart, end: today }
   }
}

export async function getDashboardChartsService(filters: ChartFilters): Promise<DashboardCharts> {
   const { start, end } = getDateRange(filters.period, filters.startDate, filters.endDate)
   const today = getTodayInBrazilTimezone()

   // Contas a pagar por mês
   const accountsPayableData = await prisma.accountsPayable.groupBy({
      by: ['dueDate'],
      where: {
         dueDate: {
            gte: start,
            lte: end,
         },
      },
      _sum: {
         value: true,
      },
      orderBy: {
         dueDate: 'asc',
      },
   })

   // Contas a receber por mês
   const accountsReceivableData = await prisma.accountsReceivable.groupBy({
      by: ['dueDate'],
      where: {
         dueDate: {
            gte: start,
            lte: end,
         },
      },
      _sum: {
         value: true,
      },
      orderBy: {
         dueDate: 'asc',
      },
   })

   // Fluxo de caixa por período
   const cashFlowData = await prisma.cashFlow.groupBy({
      by: ['date', 'type'],
      where: {
         date: {
            gte: start,
            lte: end,
         },
      },
      _sum: {
         value: true,
      },
      orderBy: {
         date: 'asc',
      },
   })

   // Status de pagamentos
   const [paidCount, pendingCount, overdueCount] = await Promise.all([
      prisma.accountsPayable.count({
         where: { status: 'PAID' },
      }),
      prisma.accountsPayable.count({
         where: { status: 'PENDING', dueDate: { gte: today } },
      }),
      prisma.accountsPayable.count({
         where: { status: 'PENDING', dueDate: { lt: today } },
      }),
   ])

   // Top centros de custo
   const topCostCentersData = await prisma.accountsPayable.groupBy({
      by: ['costCenterId'],
      where: {
         costCenterId: { not: null },
         createdAt: {
            gte: start,
            lte: end,
         },
      },
      _sum: {
         value: true,
      },
      orderBy: {
         _sum: {
            value: 'desc',
         },
      },
      take: 5,
   })

   // Buscar nomes dos centros de custo
   const costCenterIds = topCostCentersData.map((item) => item.costCenterId).filter(Boolean) as string[]
   const costCenters = await prisma.costCenter.findMany({
      where: {
         id: { in: costCenterIds },
      },
      select: {
         id: true,
         name: true,
      },
   })

   // Comparação mensal (últimos 6 meses)
   const sixMonthsAgo = new Date(today)
   sixMonthsAgo.setMonth(today.getMonth() - 6)

   const monthlyRevenue = await prisma.cashFlow.groupBy({
      by: ['date'],
      where: {
         type: 'CREDIT',
         date: {
            gte: sixMonthsAgo,
            lte: today,
         },
      },
      _sum: {
         value: true,
      },
      orderBy: {
         date: 'asc',
      },
   })

   const monthlyExpenses = await prisma.cashFlow.groupBy({
      by: ['date'],
      where: {
         type: 'DEBIT',
         date: {
            gte: sixMonthsAgo,
            lte: today,
         },
      },
      _sum: {
         value: true,
      },
      orderBy: {
         date: 'asc',
      },
   })

   // Formatação dos dados
   const accountsPayableChart: ChartData[] = accountsPayableData.map((item) => ({
      label: item.dueDate?.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) || 'N/A',
      value: (item._sum.value || 0) / 100, // Converter centavos para reais
      date: item.dueDate?.toISOString(),
   }))

   const accountsReceivableChart: ChartData[] = accountsReceivableData.map((item) => ({
      label: item.dueDate?.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) || 'N/A',
      value: (item._sum.value || 0) / 100,
      date: item.dueDate?.toISOString(),
   }))

   const cashFlowChart: ChartData[] = cashFlowData.map((item) => ({
      label: `${item.date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })} - ${item.type === 'CREDIT' ? 'Entrada' : 'Saída'}`,
      value: (item._sum.value || 0) / 100,
      date: item.date.toISOString(),
   }))

   const topCostCenters: ChartData[] = topCostCentersData.map((item) => {
      const costCenter = costCenters.find((cc) => cc.id === item.costCenterId)
      return {
         label: costCenter?.name || 'Centro de Custo Desconhecido',
         value: (item._sum.value || 0) / 100,
      }
   })

   const revenue: ChartData[] = monthlyRevenue.map((item) => ({
      label: item.date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      value: (item._sum.value || 0) / 100,
      date: item.date.toISOString(),
   }))

   const expenses: ChartData[] = monthlyExpenses.map((item) => ({
      label: item.date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      value: (item._sum.value || 0) / 100,
      date: item.date.toISOString(),
   }))

   return {
      accountsPayableChart,
      accountsReceivableChart,
      cashFlowChart,
      monthlyComparisonChart: {
         revenue,
         expenses,
      },
      paymentStatusChart: {
         paid: paidCount,
         pending: pendingCount,
         overdue: overdueCount,
      },
      topCostCenters,
   }
}
