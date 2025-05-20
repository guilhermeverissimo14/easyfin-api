import { AppError } from '@/helpers/app-error'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const updateCostCenterService = async (
   id: string,
   costCenterData: {
      name?: string
   },
) => {
   const costCenter = await prisma.costCenter.findUnique({
      where: {
         id,
      },
   })

   if (!costCenter) {
      throw new AppError('Centro de custo não encontrado', 404)
   }

   const updatedCostCenter = await prisma.costCenter.update({
      where: {
         id,
      },
      data: {
         ...costCenterData,
      },
   })

   return updatedCostCenter
}
