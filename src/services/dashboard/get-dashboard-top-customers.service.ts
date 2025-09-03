import { prisma } from '@/lib/prisma'
import { getTodayInBrazilTimezone } from '@/utils/format'

interface TopCustomersFilters {
   limit: number
   startDate?: Date
   endDate?: Date
}

interface TopCustomer {
   id: string
   name: string
   cnpj: string
   email?: string
   totalValue: number
   totalInvoices: number
   totalReceived: number
   pendingValue: number
}

function getDateRange(filters: TopCustomersFilters) {
   const today = getTodayInBrazilTimezone()
   
   if (filters.startDate && filters.endDate) {
      return { start: filters.startDate, end: filters.endDate }
   }
   
   // Se não há filtros de data, usa o ano atual como padrão
   const yearStart = new Date(today.getFullYear(), 0, 1)
   return { start: yearStart, end: today }
}

export async function getDashboardTopCustomersService(filters: TopCustomersFilters): Promise<TopCustomer[]> {
   const { start, end } = getDateRange(filters)

   // Buscar clientes com maior volume de faturamento no período
   const topCustomersData = await prisma.customer.findMany({
      select: {
         id: true,
         name: true,
         cnpj: true,
         email: true,
         Invoice: {
            where: {
               issueDate: {
                  gte: start,
                  lte: end,
               },
            },
            select: {
               serviceValue: true,
               netValue: true,
            },
         },
         AccountsReceivable: {
            where: {
               createdAt: {
                  gte: start,
                  lte: end,
               },
            },
            select: {
               value: true,
               receivedValue: true,
               status: true,
            },
         },
      },
      take: filters.limit * 2, // Buscar mais para filtrar depois
   })

   // Processar dados e calcular totais
   const processedCustomers: TopCustomer[] = topCustomersData.map(customer => {
      const totalInvoiceValue = customer.Invoice.reduce((sum, invoice) => {
         return sum + (invoice.serviceValue || 0)
      }, 0)

      const totalReceived = customer.AccountsReceivable
         .filter(account => account.status === 'PAID')
         .reduce((sum, account) => sum + (account.receivedValue || 0), 0)

      const pendingValue = customer.AccountsReceivable
         .filter(account => account.status === 'PENDING')
         .reduce((sum, account) => sum + (account.value || 0), 0)

      const totalValue = customer.AccountsReceivable.reduce((sum, account) => {
         return sum + (account.value || 0)
      }, 0)

      return {
         id: customer.id,
         name: customer.name,
         cnpj: customer.cnpj,
         email: customer.email || undefined,
         totalValue: totalValue / 100, // Converter centavos para reais
         totalInvoices: customer.Invoice.length,
         totalReceived: totalReceived / 100,
         pendingValue: pendingValue / 100,
      }
   })

   // Ordenar por valor total e retornar apenas o limite solicitado
   return processedCustomers
      .filter(customer => customer.totalValue > 0) // Filtrar apenas clientes com movimentação
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, filters.limit)
}