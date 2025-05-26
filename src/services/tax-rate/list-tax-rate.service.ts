import { AppError } from '@/helpers/app-error'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const listTaxRateService = async () => {
   try {
      const taxRates = await prisma.taxRates.findMany({
         orderBy: [{ year: 'desc' }, { month: 'desc' }],
      })

      if (!taxRates || taxRates.length === 0) {
         throw new AppError('Nenhuma taxa encontrada', 404)
      }

      return taxRates
   } catch (error) {
      console.error(error)
      throw new Error('Erro ao listar as taxas')
   }
}
