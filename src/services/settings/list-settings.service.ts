import { PrismaClient } from '@prisma/client'
import { AppError } from '@/helpers/app-error'

const prisma = new PrismaClient()

export const listSettingsService = async () => {
   try {
      const settings = await prisma.settings.findFirst()

      if (!settings) {
         throw new AppError('Configurações não encontradas', 404)
      }

      return settings
   } catch (error) {
      console.error(error)
      throw new AppError('Erro ao listar as configurações', 500)
   }
}
