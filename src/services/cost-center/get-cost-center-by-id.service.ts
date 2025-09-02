import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

export const getCostCenterByIdService = async (id: string) => {
   const costCenter = await prisma.costCenter.findUnique({
      where: {
         id,
      },
   })

   if (!costCenter) {
      throw new AppError('Centro de custo não encontrado', 404)
   }

   return costCenter
}
