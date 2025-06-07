import { AppError } from '@/helpers/app-error'
import { validateSchema } from '@/helpers/validate-schema'
import { createCashFlowSchema } from '@/schemas/cash-flow'
import { createCashFlowService } from '@/services/cash-flow/create-cash-flow.service'
import { getCashFlowTotalsPerDayService } from '@/services/cash-flow/get-cash-flow-totals-per-day.service'
import { listCashFlowByAccountIdService } from '@/services/cash-flow/list-cash-flow-by-account-Id.service'
import { listCashFlowByCashBoxIdService } from '@/services/cash-flow/list-cash-flow-by-cash-Id.service'
import { TransactionType } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'

class CashFlowController {
   constructor() {}

   public async getTotalsPerDay(
      request: FastifyRequest<{
         Querystring: {
            bankAccountId?: string
            cashId?: string
            date?: string
         }
      }>,
      reply: FastifyReply,
   ) {
      const { bankAccountId, cashId, date } = request.query

      try {
         const totals = await getCashFlowTotalsPerDayService({
            bankAccountId,
            cashId,
            date: date ? new Date(date) : new Date(),
         })

         return reply.status(200).send(totals)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async create(
      request: FastifyRequest<{
         Body: {
            date: string
            historic: string
            type: TransactionType
            description?: string
            value: number
            costCenterId?: string
            bankAccountId?: string
            cashBoxId?: string
         }
      }>,
      reply: FastifyReply,
   ) {
      const data = request.body

      const validationError = await validateSchema(createCashFlowSchema, data, reply)
      if (validationError) return

      try {
         const cashFlow = await createCashFlowService(data)
         return reply.status(201).send(cashFlow)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async listByAccountId(
      request: FastifyRequest<{
         Params: { bankAccountId: string }
      }>,
      reply: FastifyReply,
   ) {
      const { bankAccountId } = request.params

      try {
         const cashFlowList = await listCashFlowByAccountIdService(bankAccountId)
         return reply.status(200).send(cashFlowList)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async listByCash(request: FastifyRequest, reply: FastifyReply) {
      try {
         const cashFlowList = await listCashFlowByCashBoxIdService()
         return reply.status(200).send(cashFlowList)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }
}

export default new CashFlowController()
