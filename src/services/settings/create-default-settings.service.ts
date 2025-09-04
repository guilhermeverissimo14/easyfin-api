import { prisma } from '@/lib/prisma'
import { AppError } from '@/helpers/app-error'

export const createDefaultSettingsService = async (userId: string) => {
   try {
      const settings = await prisma.settings.create({
         data: {
            userId,
            cashFlowDefault: 'CASH',
            showClock: true
         }
      })
      
      return settings
   } catch (error) {
      console.error(error)
      throw new AppError('Erro ao criar configurações padrão', 500)
   }
}