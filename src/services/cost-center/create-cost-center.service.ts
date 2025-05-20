import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
