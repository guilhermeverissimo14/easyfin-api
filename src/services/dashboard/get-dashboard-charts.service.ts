import { prisma } from '@/lib/prisma'
import { getTodayInBrazilTimezone } from '@/utils/format'

interface ChartFilters {
   month?: string
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
   cashFlowChart: {
      entries: number
      exits: number
   }
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

function getDateRange(filters: ChartFilters) {
   const today = getTodayInBrazilTimezone()
   console.log('filters', filters)
   
   if (filters.startDate && filters.endDate) {
      return { start: filters.startDate, end: filters.endDate }
   }
   
   if (filters.month) {
      const [monthStr, yearStr] = filters.month.split('/')
      const monthNum = parseInt(monthStr) - 1
      const year = parseInt(yearStr)

      console.log({ monthNum, year })
      
      const startOfMonth = new Date(year, monthNum, 1)
      const endOfMonth = new Date(year, monthNum + 1, 0, 23, 59, 59)
      
      return { start: startOfMonth, end: endOfMonth }
   }
   
   const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
   const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
   
   return { start: startOfMonth, end: endOfMonth }
}

function groupByMonth(data: any[], dateField: string, valueField: string) {
   const grouped = new Map<string, number>()
   
   data.forEach(item => {
      const date = item[dateField]
      if (date) {
         const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
         const currentValue = grouped.get(monthYear) || 0
         grouped.set(monthYear, currentValue + (item[valueField] || 0))
      }
   })
   
   return grouped
}

function ensureMinimumMonths(data: ChartData[], currentMonth: Date): ChartData[] {
   if (data.length >= 3) return data
   
   const result = [...data]
   const monthsToAdd = 3 - data.length
   
   for (let i = 0; i <= Math.ceil(monthsToAdd / 2); i++) {
      const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i, 1)
      const monthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`
      
      if (!result.some(item => item.date?.includes(monthKey))) {
         result.unshift({
            label: prevMonth.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
            value: 0,
            date: prevMonth.toISOString()
         })
      }
   }
   
   for (let i = 0; result.length < 2; i++) {
      const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + i, 1)
      result.push({
         label: nextMonth.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
         value: 0,
         date: nextMonth.toISOString()
      })
   }
   
   return result.sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
}

export async function getDashboardChartsService(filters: ChartFilters): Promise<DashboardCharts> {
   const { start, end } = getDateRange(filters)
   const today = getTodayInBrazilTimezone()

   const accountsPayableData = await prisma.accountsPayable.findMany({
      where: {
         dueDate: {
            gte: start,
            lte: end,
         },
      },
      select: {
         dueDate: true,
         value: true,
      },
   })

   const accountsReceivableData = await prisma.accountsReceivable.findMany({
      where: {
         dueDate: {
            gte: start,
            lte: end,
         },
      },
      select: {
         dueDate: true,
         value: true,
      },
   })

   console.log({ start, end})

   const cashFlowData = await prisma.cashFlow.findMany({
      where: {
         date: {
            gte: start,
            lte: end,
         },
      },
      select: {
         date: true,
         type: true,
         value: true,
      },
   })

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

   const sixMonthsAgo = new Date(today)
   sixMonthsAgo.setMonth(today.getMonth() - 6)

   const monthlyRevenue = await prisma.cashFlow.findMany({
      where: {
         type: 'CREDIT',
         date: {
            gte: sixMonthsAgo,
            lte: today,
         },
      },
      select: {
         date: true,
         value: true,
      },
   })

   const monthlyExpenses = await prisma.cashFlow.findMany({
      where: {
         type: 'DEBIT',
         date: {
            gte: sixMonthsAgo,
            lte: today,
         },
      },
      select: {
         date: true,
         value: true,
      },
   })

   const groupedPayable = groupByMonth(accountsPayableData, 'dueDate', 'value')
   const groupedReceivable = groupByMonth(accountsReceivableData, 'dueDate', 'value')
   const groupedRevenue = groupByMonth(monthlyRevenue, 'date', 'value')
   const groupedExpenses = groupByMonth(monthlyExpenses, 'date', 'value')

   const accountsPayableChart: ChartData[] = Array.from(groupedPayable.entries()).map(([monthYear, value]) => {
      const [year, month] = monthYear.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, 1)
      return {
         label: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
         value: value / 100,
         date: date.toISOString(),
      }
   }).sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())

   const accountsReceivableChart: ChartData[] = Array.from(groupedReceivable.entries()).map(([monthYear, value]) => {
      const [year, month] = monthYear.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, 1)
      return {
         label: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
         value: value / 100,
         date: date.toISOString(),
      }
   }).sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())

   console.log('cashFlowData', cashFlowData)

   const cashFlowEntries = cashFlowData
      .filter(item => item.type === 'CREDIT')
      .reduce((sum, item) => sum + item.value, 0) / 100

   const cashFlowExits = cashFlowData
      .filter(item => item.type === 'DEBIT')
      .reduce((sum, item) => sum + item.value, 0) / 100

   console.log({ cashFlowEntries, cashFlowExits })

   const topCostCenters: ChartData[] = topCostCentersData.map((item) => {
      const costCenter = costCenters.find((cc) => cc.id === item.costCenterId)
      return {
         label: costCenter?.name || 'Centro de Custo Desconhecido',
         value: (item._sum.value || 0) / 100,
      }
   })

   let revenue: ChartData[] = Array.from(groupedRevenue.entries()).map(([monthYear, value]) => {
      const [year, month] = monthYear.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, 1)
      return {
         label: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
         value: value / 100,
         date: date.toISOString(),
      }
   }).sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())

   let expenses: ChartData[] = Array.from(groupedExpenses.entries()).map(([monthYear, value]) => {
      const [year, month] = monthYear.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, 1)
      return {
         label: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
         value: value / 100,
         date: date.toISOString(),
      }
   }).sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())

   revenue = ensureMinimumMonths(revenue, today)
   expenses = ensureMinimumMonths(expenses, today)

   return {
      accountsPayableChart,
      accountsReceivableChart,
      cashFlowChart: {
         entries: cashFlowEntries,
         exits: cashFlowExits,
      },
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
