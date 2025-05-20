import { AppError } from '@/helpers/app-error'
import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

export const deleteCostCenterService = async (id: string, userRole: string) => {
   if (userRole !== UserRole.ADMIN) {
      throw new AppError('Acesso negado', 403)
   }

   const costCenter = await prisma.costCenter.findUnique({
      where: {
         id,
      },
   })

   if (!costCenter) {
      throw new AppError('Centro de custo não encontrado', 404)
   }

   try {
      await prisma.costCenter.delete({
         where: {
            id,
         },
      })
   } catch (error) {
      console.error(error)
      throw new Error('Erro ao remover o centro de custo')
   }
   return { message: 'Centro de custo removido com sucesso' }
}
