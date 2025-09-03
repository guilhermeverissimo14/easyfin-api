import { prisma } from '@/lib/prisma'
import { getTodayInBrazilTimezone } from '@/utils/format'

interface TopSuppliersFilters {
   limit: number
   startDate?: Date
   endDate?: Date
}

interface TopSupplier {
   id: string
   name: string
   cnpj: string
   email?: string
   totalValue: number
   totalAccounts: number
   totalPaid: number
   pendingValue: number
}

function getDateRange(filters: TopSuppliersFilters) {
   const today = getTodayInBrazilTimezone()
   
   if (filters.startDate && filters.endDate) {
      return { start: filters.startDate, end: filters.endDate }
   }
   
   // Se não há filtros de data, usa o ano atual como padrão
   const yearStart = new Date(today.getFullYear(), 0, 1)
   return { start: yearStart, end: today }
}

export async function getDashboardTopSuppliersService(filters: TopSuppliersFilters): Promise<TopSupplier[]> {
   const { start, end } = getDateRange(filters)

   // Buscar fornecedores com maior volume de contas a pagar no período
   const topSuppliersData = await prisma.supplier.findMany({
      select: {
         id: true,
         name: true,
         cnpj: true,
         email: true,
         AccountsPayable: {
            where: {
               createdAt: {
                  gte: start,
                  lte: end,
               },
            },
            select: {
               value: true,
               paidValue: true,
               status: true,
            },
         },
      },
      take: filters.limit * 2, // Buscar mais para filtrar depois
   })

   // Processar dados e calcular totais
   const processedSuppliers: TopSupplier[] = topSuppliersData.map(supplier => {
      const totalPaid = supplier.AccountsPayable
         .filter(account => account.status === 'PAID')
         .reduce((sum, account) => sum + (account.paidValue || 0), 0)

      const pendingValue = supplier.AccountsPayable
         .filter(account => account.status === 'PENDING')
         .reduce((sum, account) => sum + (account.value || 0), 0)

      const totalValue = supplier.AccountsPayable.reduce((sum, account) => {
         return sum + (account.value || 0)
      }, 0)

      return {
         id: supplier.id,
         name: supplier.name,
         cnpj: supplier.cnpj,
         email: supplier.email || undefined,
         totalValue: totalValue / 100, // Converter centavos para reais
         totalAccounts: supplier.AccountsPayable.length,
         totalPaid: totalPaid / 100,
         pendingValue: pendingValue / 100,
      }
   })

   // Ordenar por valor total e retornar apenas o limite solicitado
   return processedSuppliers
      .filter(supplier => supplier.totalValue > 0) // Filtrar apenas fornecedores com movimentação
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, filters.limit)
}