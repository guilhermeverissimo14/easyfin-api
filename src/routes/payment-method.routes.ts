import PaymentMethodsController from '@/controllers/payment-method.controller'
import { listPaymentMethodSchema } from '@/documentation/payment-method.schemas'
import { authMiddleware } from '@/middleware/auth.middleware'
import { FastifyPluginAsync } from 'fastify'

const paymentMethodsRoutes: FastifyPluginAsync = async (server) => {
   //Rota para listar métodos de pagamento
   server.get('/', { preHandler: authMiddleware, schema: listPaymentMethodSchema }, PaymentMethodsController.list)
}

export { paymentMethodsRoutes }
