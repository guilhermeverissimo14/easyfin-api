import { FastifyPluginAsync } from 'fastify'
import UserController from '@/controllers/user.controller'
import { createUserSchema, listUsersSchema, listUserById, updateUserSchema, toogleUserStatusSchema } from '@/documentation/user.schemas'
import { authMiddleware } from '@/middleware/auth.middleware'

const userRoutes: FastifyPluginAsync = async (server) => {
   // Rota para listar usuários
   server.get('/', { preHandler: authMiddleware, schema: listUsersSchema }, UserController.list)

   // Rota para criar usuário
   server.post('/', { preHandler: authMiddleware, schema: createUserSchema }, UserController.create)

   // Rota para listar um usuário
   server.get('/:id', { preHandler: authMiddleware, schema: listUserById }, UserController.getById)

   // Rota para atualizar um usuário
   server.put('/:id', { preHandler: authMiddleware, schema: updateUserSchema }, UserController.update)

   // Rota para ativar/desativar um usuário
   server.patch('/:id/toggle-status', { preHandler: authMiddleware, schema: toogleUserStatusSchema }, UserController.toggleStatus)
}

export { userRoutes }
