import { FastifyPluginAsync } from 'fastify'
import { authMiddleware } from '@/middleware/auth.middleware'
import { updateSettingsSchema, listSettingsSchema } from '@/documentation/settings.schemas'
import SettingsController from '@/controllers/settings.controller'

const settingsRoutes: FastifyPluginAsync = async (server) => {
   // Rota para listar as configurações do sistema
   server.get('/', { preHandler: authMiddleware, schema: listSettingsSchema }, SettingsController.list)

   // Rota para atualizar as configurações do sistema
   server.put('/', { preHandler: authMiddleware, schema: updateSettingsSchema }, SettingsController.update)
}

export { settingsRoutes }
