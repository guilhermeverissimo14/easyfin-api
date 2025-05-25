import { AppError } from '@/helpers/app-error'
import { listPaymentMethodsService } from '@/services/payment-method/list-payment-method.service'
import { FastifyReply, FastifyRequest } from 'fastify'

class PaymentMethodController {
   constructor() {}

   public async list(request: FastifyRequest, reply: FastifyReply) {
      try {
         const paymentMethods = await listPaymentMethodsService()
         return reply.status(200).send(paymentMethods)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }
}

export default new PaymentMethodController()
