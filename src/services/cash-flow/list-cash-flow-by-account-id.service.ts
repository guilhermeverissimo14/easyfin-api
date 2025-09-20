import { TransactionType } from '@prisma/client'
import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

interface CashFlowFilters {
   page: number
   limit: number
   type?: string
   description?: string
   history?: string
   costCenterId?: string
   dateStart?: Date
   dateEnd?: Date
   valueMin?: number
   valueMax?: number
}

const setToStartOfDayUTC = (date: Date) => {
   const newDate = new Date(date)
   newDate.setUTCHours(0, 0, 0, 0)
   return newDate
}

const setToEndOfDayUTC = (date: Date) => {
   const newDate = new Date(date)
   newDate.setUTCHours(23, 59, 59, 999)
   return newDate
}

const formatCurrency = (value: number) => {
   return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
   }).format(value)
}

export const listCashFlowByAccountIdService = async (bankAccountId: string, filters: CashFlowFilters) => {
   const { page, limit, type, description, history, costCenterId, dateStart, dateEnd, valueMin, valueMax } = filters
   const skip = (page - 1) * limit

   let startDate = dateStart
   let endDate = dateEnd
   
   if (startDate) {
      startDate = setToStartOfDayUTC(startDate)
   }
   if (endDate) {
      endDate = setToEndOfDayUTC(endDate)
   }

   const whereClause: any = {
      bankAccountId,
   }

   if (type) {
      whereClause.type = type
   }

   if (description) {
      whereClause.description = {
         contains: description,
         mode: 'insensitive'
      }
   }

   if (history) {
      whereClause.historic = {
         contains: history,
         mode: 'insensitive'
      }
   }

   if (costCenterId) {
      if (costCenterId === 'empty') {
         // Filtrar registros com centro de custo vazio
         whereClause.OR = [
            { costCenterId: null },
            { costCenterId: '' },
            {
               CostCenter: {
                  OR: [
                     { id: '' },
                     { name: '' },
                     { AND: [{ id: '' }, { name: '' }] }
                  ]
               }
            }
         ]
      } else {
         whereClause.costCenterId = costCenterId
      }
   }

   if (startDate || endDate) {
      whereClause.date = {
         ...(startDate ? { gte: startDate } : {}),
         ...(endDate ? { lte: endDate } : {}),
      }
   }

   if (valueMin !== undefined || valueMax !== undefined) {
      whereClause.value = {
         ...(valueMin !== undefined ? { gte: Math.round(valueMin * 100) } : {}),
         ...(valueMax !== undefined ? { lte: Math.round(valueMax * 100) } : {}),
      }
   }
   try {
      const bankAccount = await prisma.bankAccounts.findUnique({
         where: {
            id: bankAccountId,
         },
      })

      if (!bankAccount) {
         throw new AppError('Conta bancária não encontrada', 404)
      }

      const [cashFlowList, totalCount] = await Promise.all([
         prisma.cashFlow.findMany({
            where: whereClause,
            include: {
               CostCenter: true,
            },
            orderBy: {
               date: 'desc',
            },
            skip,
            take: limit,
         }),
         prisma.cashFlow.count({
            where: whereClause,
         })
      ])

      const allCashFlowForBalance = await prisma.cashFlow.findMany({
         where: {
            bankAccountId,
         },
         orderBy: [
            { date: 'asc' },
            { createdAt: 'asc' }
         ],
      })

      const balanceMap = new Map<string, number>()
      let runningBalance = 0
      
      for (const entry of allCashFlowForBalance) {
         runningBalance = entry.type === TransactionType.CREDIT 
            ? runningBalance + entry.value 
            : runningBalance - entry.value
         balanceMap.set(entry.id, runningBalance)
      }

      const totalPages = Math.ceil(totalCount / limit)
      const hasNextPage = page < totalPages
      const hasPreviousPage = page > 1

      return {
         data: cashFlowList.map((cashFlow) => ({
            id: cashFlow.id,
            cashBoxId: cashFlow.cashBoxId,
            type: cashFlow.type,
            description: cashFlow.description,
            history: cashFlow.historic,
            value: formatCurrency(cashFlow.value / 100),
            balance: formatCurrency((balanceMap.get(cashFlow.id) || 0) / 100),
            documentNumber: cashFlow.documentNumber,
            date: cashFlow.date.toISOString(),
            costCenter: {
               id: cashFlow.costCenterId,
               name: cashFlow.CostCenter?.name || null,
            },
         })),
         pagination: {
            page,
            limit,
            totalCount,
            totalPages,
            hasNextPage,
            hasPreviousPage,
         },
      }
   } catch (error) {
      if (error instanceof AppError) {
         throw error
      }
      throw new AppError('Erro ao listar lançamentos do fluxo de caixa por conta bancária', 500)
   }
}
