import PaymentTermsController from '@/controllers/payment-terms.controller'
import {
   createPaymentTermSchema,
   listPaymentTermSchema,
   getPaymentTermByIdSchema,
   updatePaymentTermSchema,
   deletePaymentTermSchema,
} from '@/documentation/payment-term.schemas'
import { authMiddleware } from '@/middleware/auth.middleware'
import { FastifyPluginAsync } from 'fastify'

const paymentTermsRoutes: FastifyPluginAsync = async (server) => {
   //Rota para listar condições de pagamento
   server.get('/', { preHandler: authMiddleware, schema: listPaymentTermSchema }, PaymentTermsController.list)

   //Rota para criar condição de pagamento
   server.post('/', { preHandler: authMiddleware, schema: createPaymentTermSchema }, PaymentTermsController.create)

   //Rota para listar uma condição de pagamento
   server.get('/:id', { preHandler: authMiddleware, schema: getPaymentTermByIdSchema }, PaymentTermsController.getById)

   //Rota para atualizar uma condição de pagamento
   server.put('/:id', { preHandler: authMiddleware, schema: updatePaymentTermSchema }, PaymentTermsController.update)

   //Rota para deletar uma condição de pagamento
   server.delete('/:id', { preHandler: authMiddleware, schema: deletePaymentTermSchema }, PaymentTermsController.delete)
}

export { paymentTermsRoutes }
