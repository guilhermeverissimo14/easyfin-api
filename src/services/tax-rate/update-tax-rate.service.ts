import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

export const updateTaxRateService = async (
   id: string,
   taxRatesData: {
      year?: number
      month?: number
      issqnTaxRate?: number
      effectiveTaxRate?: number
   },
) => {
   const taxRate = await prisma.taxRates.findUnique({
      where: {
         id,
      },
   })

   if (!taxRate) {
      throw new AppError('Taxa não encontrada', 404)
   }

   try {
      const updatedTaxRates = await prisma.taxRates.update({
         where: {
            id,
         },
         data: {
            ...taxRatesData,
         },
      })

      return updatedTaxRates
   } catch (error) {
      console.error(error)
      throw new Error('Erro ao atualizar a taxa')
   }
}
