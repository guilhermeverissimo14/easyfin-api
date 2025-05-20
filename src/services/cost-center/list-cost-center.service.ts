import { AppError } from '@/helpers/app-error'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const listCostCenterService = async () => {
   const costCenters = await prisma.costCenter.findMany({
      orderBy: {
         name: 'asc',
      },
   })

   if (!costCenters || costCenters.length === 0) {
      throw new AppError('Nenhum centro de custo encontrado', 404)
   }

   return costCenters
}
