import { prisma } from '@/lib/prisma'
import { getTodayInBrazilTimezone } from '@/utils/format'

interface RecentTransactionsFilters {
   limit: number
   type: 'all' | 'payable' | 'receivable' | 'cash-flow'
   startDate?: Date
   endDate?: Date
}

interface RecentTransaction {
   id: string
   type: 'payable' | 'receivable' | 'cash-flow'
   description: string
   value: number
   date: Date
   status?: string
   customerName?: string
   supplierName?: string
   documentNumber?: string
}

function getDateRange(filters: RecentTransactionsFilters) {
   const today = getTodayInBrazilTimezone()
   
   if (filters.startDate && filters.endDate) {
      return { start: filters.startDate, end: filters.endDate }
   }
   
   // Se não há filtros de data, retorna um range amplo para pegar transações recentes
   const thirtyDaysAgo = new Date(today)
   thirtyDaysAgo.setDate(today.getDate() - 30)
   
   return { start: thirtyDaysAgo, end: today }
}

export async function getDashboardRecentTransactionsService(
   filters: RecentTransactionsFilters,
): Promise<RecentTransaction[]> {
   const { start, end } = getDateRange(filters)
   const transactions: RecentTransaction[] = []

   // Buscar contas a pagar recentes
   if (filters.type === 'all' || filters.type === 'payable') {
      const recentPayables = await prisma.accountsPayable.findMany({
         where: {
            createdAt: {
               gte: start,
               lte: end,
            },
         },
         select: {
            id: true,
            value: true,
            status: true,
            documentNumber: true,
            createdAt: true,
            paymentDate: true,
            dueDate: true,
            Supplier: {
               select: {
                  name: true,
               },
            },
         },
         orderBy: {
            createdAt: 'desc',
         },
         take: filters.type === 'payable' ? filters.limit : Math.ceil(filters.limit / 3),
      })

      const payableTransactions: RecentTransaction[] = recentPayables.map(payable => ({
         id: payable.id,
         type: 'payable' as const,
         description: `Conta a Pagar - ${payable.Supplier.name}`,
         value: (payable.value || 0) / 100,
         date: payable.paymentDate || payable.dueDate || payable.createdAt,
         status: payable.status,
         supplierName: payable.Supplier.name,
         documentNumber: payable.documentNumber || undefined,
      }))

      transactions.push(...payableTransactions)
   }

   // Buscar contas a receber recentes
   if (filters.type === 'all' || filters.type === 'receivable') {
      const recentReceivables = await prisma.accountsReceivable.findMany({
         where: {
            createdAt: {
               gte: start,
               lte: end,
            },
         },
         select: {
            id: true,
            value: true,
            status: true,
            documentNumber: true,
            createdAt: true,
            receiptDate: true,
            dueDate: true,
            Customer: {
               select: {
                  name: true,
               },
            },
         },
         orderBy: {
            createdAt: 'desc',
         },
         take: filters.type === 'receivable' ? filters.limit : Math.ceil(filters.limit / 3),
      })

      const receivableTransactions: RecentTransaction[] = recentReceivables.map(receivable => ({
         id: receivable.id,
         type: 'receivable' as const,
         description: `Conta a Receber - ${receivable.Customer.name}`,
         value: (receivable.value || 0) / 100,
         date: receivable.receiptDate || receivable.dueDate || receivable.createdAt,
         status: receivable.status,
         customerName: receivable.Customer.name,
         documentNumber: receivable.documentNumber || undefined,
      }))

      transactions.push(...receivableTransactions)
   }

   // Buscar movimentações de fluxo de caixa recentes
   if (filters.type === 'all' || filters.type === 'cash-flow') {
      const recentCashFlow = await prisma.cashFlow.findMany({
         where: {
            date: {
               gte: start,
               lte: end,
            },
         },
         select: {
            id: true,
            historic: true,
            value: true,
            type: true,
            date: true,
            description: true,
            CostCenter: {
               select: {
                  name: true,
               },
            },
         },
         orderBy: {
            date: 'desc',
         },
         take: filters.type === 'cash-flow' ? filters.limit : Math.ceil(filters.limit / 3),
      })

      const cashFlowTransactions: RecentTransaction[] = recentCashFlow.map(cashFlow => ({
         id: cashFlow.id,
         type: 'cash-flow' as const,
         description: cashFlow.historic || cashFlow.description || 'Movimentação de Caixa',
         value: (cashFlow.value || 0) / 100,
         date: cashFlow.date,
         status: cashFlow.type === 'CREDIT' ? 'Entrada' : 'Saída',
      }))

      transactions.push(...cashFlowTransactions)
   }

   // Ordenar todas as transações por data (mais recentes primeiro) e limitar
   return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, filters.limit)
}