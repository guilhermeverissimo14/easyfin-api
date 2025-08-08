import { PrismaClient } from '@prisma/client'
import { AppError } from '@/helpers/app-error'
import { formatCurrency, setToEndOfDayUTC, setToStartOfDayUTC } from '@/utils/format'

const prisma = new PrismaClient()

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

export const listCashFlowByCashBoxIdService = async (filters: CashFlowFilters) => {
   const { page, limit, type, description, history, costCenterId, dateStart, dateEnd, valueMin, valueMax } = filters
   const skip = (page - 1) * limit

   const cash = await prisma.cashBox.findFirst()

   if (!cash) {
      throw new AppError('Caixa não encontrado', 404)
   }

   const cashBoxId = cash.id

   let startDate = dateStart
   let endDate = dateEnd

   if (startDate) {
      startDate = setToStartOfDayUTC(startDate)
   }
   if (endDate) {
      endDate = setToEndOfDayUTC(endDate)
   }

   const whereClause: any = {
      cashBoxId,
   }

   if (type) {
      whereClause.type = type
   }

   if (description) {
      whereClause.description = {
         contains: description,
         mode: 'insensitive',
      }
   }

   if (history) {
      whereClause.historic = {
         contains: history,
         mode: 'insensitive',
      }
   }

   if (costCenterId) {
      whereClause.costCenterId = costCenterId
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
      // Buscar dados com paginação
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
         }),
      ])

      const totalPages = Math.ceil(totalCount / limit)
      const hasNextPage = page < totalPages
      const hasPreviousPage = page > 1

      return {
         data: cashFlowList.map((cashFlow) => ({
            id: cashFlow.id,
            type: cashFlow.type,
            description: cashFlow.description,
            history: cashFlow.historic,
            value: formatCurrency(cashFlow.value / 100),
            balance: formatCurrency(cashFlow.balance / 100),
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
      throw new AppError('Erro ao listar lançamentos do fluxo de caixa por caixa', 500)
   }
}
