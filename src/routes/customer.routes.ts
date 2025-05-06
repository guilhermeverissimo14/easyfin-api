import { FastifyPluginAsync } from 'fastify'
import CustomerController from '@/controllers/customer.controller'
import {
   createCustomerSchema,
   updateCustomerSchema,
   getCustomerByIdSchema,
   listCustomersSchema,
   toggleCustomerStatusSchema,
   deleteCustomerSchema,
} from '@/documentation/customer.schemas'
import { authMiddleware } from '@/middleware/auth.middleware'

const customerRoutes: FastifyPluginAsync = async (server) => {
   // Rota para listar clientes
   server.get('/', { preHandler: authMiddleware, schema: listCustomersSchema }, CustomerController.list)

   // Rota para criar cliente
   server.post('/', { preHandler: authMiddleware, schema: createCustomerSchema }, CustomerController.create)

   // Rota para listar um cliente
   server.get('/:id', { preHandler: authMiddleware, schema: getCustomerByIdSchema }, CustomerController.getById)

   // Rota para atualizar um cliente
   server.put('/:id', { preHandler: authMiddleware, schema: updateCustomerSchema }, CustomerController.update)

   // Rota para ativar/desativar um cliente
   server.patch('/:id/toggle-status', { preHandler: authMiddleware, schema: toggleCustomerStatusSchema }, CustomerController.toggleStatus)

   // Rota para deletar um cliente
   server.delete('/:id', { preHandler: authMiddleware, schema: deleteCustomerSchema }, CustomerController.delete)
}

export { customerRoutes }
