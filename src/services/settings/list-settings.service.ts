import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

export const listSettingsService = async (userId: string) => {
   try {
      const settings = await prisma.settings.findUnique({
         where: { userId }
      })

      if (!settings) {
         const newSettings = await prisma.settings.create({
            data: {
               userId,
               cashFlowDefault: 'CASH',
               showClock: true
            }
         })
         return newSettings
      }

      return settings
   } catch (error) {
      console.error(error)
      throw new AppError('Erro ao listar as configurações', 500)
   }
}
