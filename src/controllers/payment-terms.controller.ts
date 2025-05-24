import { AppError } from '@/helpers/app-error'
import { validateSchema } from '@/helpers/validate-schema'
import { createPaymentTermSchema } from '@/schemas/payment-term'
import { createPaymentTermService } from '@/services/payment-term/create-payment-term.service'
import { deletePaymentTermService } from '@/services/payment-term/delete-payment-term.service'
import { getPaymentTermByIdService } from '@/services/payment-term/get-payment-term-by-id.service'
import { listPaymentTermsService } from '@/services/payment-term/list-payment-term.service'
import { updatePaymentTermService } from '@/services/payment-term/update-payment-term.service'
import { FastifyReply, FastifyRequest } from 'fastify'

class PaymentTermsController {
   constructor() {}

   public async create(
      request: FastifyRequest<{
         Body: {
            paymentMethodId: string
            condition: string
            description?: string
            installments?: number
         }
      }>,
      reply: FastifyReply,
   ) {
      let { paymentMethodId, condition, description, installments } = request.body
      const userId = request.user?.id
      const userRole = request.user?.role

      if (!userId || !userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const validationError = await validateSchema(createPaymentTermSchema, { paymentMethodId, condition, description, installments }, reply)

      if (validationError) {
         return
      }

      if (!installments || installments < 1) {
         const conditionParts = condition.split(',').map((part) => part.trim())
         if (conditionParts.length < 1) {
            return reply.status(400).send({ message: 'Condição de pagamento inválida' })
         }
         installments = conditionParts.length
      }

      try {
         const paymentTerm = await createPaymentTermService({
            paymentMethodId,
            condition,
            description,
            installments,
         })

         return reply.status(201).send(paymentTerm)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async list(request: FastifyRequest, reply: FastifyReply) {
      try {
         const paymentTerms = await listPaymentTermsService()
         return reply.status(200).send(paymentTerms)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async getById(
      request: FastifyRequest<{
         Params: {
            id: string
         }
      }>,
      reply: FastifyReply,
   ) {
      const { id } = request.params

      try {
         const paymentTerm = await getPaymentTermByIdService(id)
         return reply.status(200).send(paymentTerm)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async update(
      request: FastifyRequest<{
         Params: {
            id: string
         }
         Body: {
            paymentMethodId?: string
            condition?: string
            description?: string
            installments?: number
         }
      }>,
      reply: FastifyReply,
   ) {
      const { id } = request.params
      const { paymentMethodId, condition, description, installments } = request.body
      const userRole = request.user?.role

      if (!userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      try {
         const updatedPaymentTerm = await updatePaymentTermService(id, { paymentMethodId, condition, description, installments })
         return reply.status(200).send(updatedPaymentTerm)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async delete(
      request: FastifyRequest<{
         Params: {
            id: string
         }
      }>,
      reply: FastifyReply,
   ) {
      const { id } = request.params
      const userRole = request.user?.role

      if (!userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      try {
         await deletePaymentTermService(id, userRole)
         return reply.status(204).send({ message: 'Condição de pagamento removida com sucesso' })
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }
}

export default new PaymentTermsController()
