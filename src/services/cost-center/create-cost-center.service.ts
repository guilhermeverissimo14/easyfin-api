import { prisma } from '@/lib/prisma'

export const createCostCenterService = async (costCenterData: { name: string }) => {
   try {
      const costCenter = await prisma.costCenter.create({
         data: {
            ...costCenterData,
         },
      })

      return costCenter
   } catch (error) {
      console.error(error)
      throw new Error('Erro ao criar o centro de custo')
   }
}
