import { AppError } from '@/helpers/app-error'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createTaxRateService = async (taxRatesData: { year: number; month: number; issqnTaxRate: number; effectiveTaxRate: number }) => {
   const { year, month } = taxRatesData

   const existingTaxRates = await prisma.taxRates.findFirst({
      where: {
         year,
         month,
      },
   })

   if (existingTaxRates) {
      throw new AppError('Taxa já cadastrada para este ano e mês', 400)
   }

   try {
      const taxRates = await prisma.taxRates.create({
         data: {
            ...taxRatesData,
         },
      })

      return taxRates
   } catch (error) {
      console.error(error)
      throw new Error('Erro ao criar a taxa')
   }
}
