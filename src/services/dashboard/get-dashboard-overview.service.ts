import { prisma } from '@/lib/prisma'
import { getTodayInBrazilTimezone } from '@/utils/format'

interface DashboardOverview {
   totalCustomers: number
   totalSuppliers: number
   totalInvoices: number
   totalAccountsPayable: number
   totalAccountsReceivable: number
   totalOverduePayable: number
   totalOverdueReceivable: number
   totalPaidThisMonth: number
   totalReceivedThisMonth: number
   cashFlowBalance: number
   pendingInvoices: number
   monthlyRevenue: number
   monthlyExpenses: number
}

interface GetDashboardOverviewParams {
   month?: string
}

export async function getDashboardOverviewService(params?: GetDashboardOverviewParams): Promise<DashboardOverview> {
   const today = getTodayInBrazilTimezone()
   
   let startOfMonth: Date
   let endOfMonth: Date
   
   if (params?.month) {
      const [monthStr, yearStr] = params.month.split('/')
      const month = parseInt(monthStr) - 1 
      const year = parseInt(yearStr)
      
      startOfMonth = new Date(year, month, 1)
      endOfMonth = new Date(year, month + 1, 0, 23, 59, 59)
   } else {
      startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
   }

   const [totalCustomers, totalSuppliers, totalInvoices] = await Promise.all([
      prisma.customer.count(),
      prisma.supplier.count(),
      prisma.invoice.count(),
   ])

   const [totalAccountsPayable, totalOverduePayable] = await Promise.all([
      prisma.accountsPayable.aggregate({
         where: { 
            status: 'PENDING',
            dueDate: {
               gte: startOfMonth,
               lte: endOfMonth,
            },
         },
         _sum: { value: true },
      }),
      prisma.accountsPayable.aggregate({
         where: {
            status: 'PENDING',
            dueDate: { 
               lt: today,
               gte: startOfMonth,
               lte: endOfMonth,
            },
         },
         _sum: { value: true },
      }),
   ])

   const [totalAccountsReceivable, totalOverdueReceivable] = await Promise.all([
      prisma.accountsReceivable.aggregate({
         where: { 
            status: 'PENDING',
            dueDate: {
               gte: startOfMonth,
               lte: endOfMonth,
            },
         },
         _sum: { value: true },
      }),
      prisma.accountsReceivable.aggregate({
         where: {
            status: 'PENDING',
            dueDate: { 
               lt: today,
               gte: startOfMonth,
               lte: endOfMonth,
            },
         },
         _sum: { value: true },
      }),
   ])

   const [cashFlowEntries, cashFlowExits] = await Promise.all([
      prisma.cashFlow.aggregate({
         where: { type: 'CREDIT' },
         _sum: { value: true },
      }),
      prisma.cashFlow.aggregate({
         where: { type: 'DEBIT' },
         _sum: { value: true },
      }),
   ])

   const pendingInvoices = await prisma.invoice.count()

   const [monthlyRevenue, monthlyExpenses] = await Promise.all([
      prisma.cashFlow.aggregate({
         where: {
            type: 'CREDIT',
            date: {
               gte: startOfMonth,
               lte: endOfMonth,
            },
         },
         _sum: { value: true },
      }),
      prisma.cashFlow.aggregate({
         where: {
            type: 'DEBIT',
            date: {
               gte: startOfMonth,
               lte: endOfMonth,
            },
         },
         _sum: { value: true },
      }),
   ])

   const cashFlowBalance = (cashFlowEntries._sum?.value || 0) - (cashFlowExits._sum?.value || 0)

   return {
      totalCustomers,
      totalSuppliers,
      totalInvoices,
      totalAccountsPayable: totalAccountsPayable._sum.value ? totalAccountsPayable._sum.value / 100 : 0,
      totalAccountsReceivable: totalAccountsReceivable._sum.value ? totalAccountsReceivable._sum.value / 100 : 0,
      totalOverduePayable: totalOverduePayable._sum.value ? totalOverduePayable._sum.value / 100 : 0,
      totalOverdueReceivable: totalOverdueReceivable._sum.value ? totalOverdueReceivable._sum.value / 100 : 0,
      totalPaidThisMonth: monthlyExpenses._sum?.value ? monthlyExpenses._sum.value / 100 : 0,
      totalReceivedThisMonth: monthlyRevenue._sum?.value ? monthlyRevenue._sum.value / 100 : 0,
      cashFlowBalance: cashFlowBalance / 100,
      pendingInvoices,
      monthlyRevenue: monthlyRevenue._sum?.value ? monthlyRevenue._sum.value / 100 : 0,
      monthlyExpenses: monthlyExpenses._sum?.value ? monthlyExpenses._sum.value / 100 : 0,
   }
}
