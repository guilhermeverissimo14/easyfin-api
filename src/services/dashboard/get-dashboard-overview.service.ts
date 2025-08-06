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

export async function getDashboardOverviewService(): Promise<DashboardOverview> {
   const today = getTodayInBrazilTimezone()
   const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
   const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

   // Contadores básicos
   const [totalCustomers, totalSuppliers, totalInvoices] = await Promise.all([
      prisma.customer.count(),
      prisma.supplier.count(),
      prisma.invoice.count(),
   ])

   // Contas a pagar
   const [totalAccountsPayable, totalOverduePayable, totalPaidThisMonth] = await Promise.all([
      prisma.accountsPayable.aggregate({
         where: { status: 'PENDING' },
         _sum: { value: true },
      }),
      prisma.accountsPayable.aggregate({
         where: {
            status: 'PENDING',
            dueDate: { lt: today },
         },
         _sum: { value: true },
      }),
      prisma.accountsPayable.aggregate({
         where: {
            status: 'PAID',
            paymentDate: {
               gte: startOfMonth,
               lte: endOfMonth,
            },
         },
         _sum: { paidValue: true },
      }),
   ])

   // Contas a receber
   const [totalAccountsReceivable, totalOverdueReceivable, totalReceivedThisMonth] = await Promise.all([
      prisma.accountsReceivable.aggregate({
         where: { status: 'PENDING' },
         _sum: { value: true },
      }),
      prisma.accountsReceivable.aggregate({
         where: {
            status: 'PENDING',
            dueDate: { lt: today },
         },
         _sum: { value: true },
      }),
      prisma.accountsReceivable.aggregate({
         where: {
            status: 'PAID',
            receiptDate: {
               gte: startOfMonth,
               lte: endOfMonth,
            },
         },
         _sum: { receivedValue: true },
      }),
   ])

   // Fluxo de caixa
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

   // Notas fiscais (todas as faturas)
   const pendingInvoices = await prisma.invoice.count()

   // Receitas e despesas do mês
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
      totalPaidThisMonth: totalPaidThisMonth._sum.paidValue ? totalPaidThisMonth._sum.paidValue / 100 : 0,
      totalReceivedThisMonth: totalReceivedThisMonth._sum.receivedValue ? totalReceivedThisMonth._sum.receivedValue / 100 : 0,
      cashFlowBalance: cashFlowBalance / 100,
      pendingInvoices,
      monthlyRevenue: monthlyRevenue._sum?.value ? monthlyRevenue._sum.value / 100 : 0,
      monthlyExpenses: monthlyExpenses._sum?.value ? monthlyExpenses._sum.value / 100 : 0,
   }
}
