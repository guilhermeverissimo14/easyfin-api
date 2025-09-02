import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

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
