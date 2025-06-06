import { AppError } from '@/helpers/app-error'
import { validateSchema } from '@/helpers/validate-schema'
import { createAccountsPayableSchema, updateAccountsPayableSchema } from '@/schemas/accounts-payable'
import { getTotalsAccountPayableService } from '@/services/accounts-payable/get-totals-account-payable.service'
import { createAccountPayableService } from '@/services/accounts-payable/create-account-payable.service'
import { deleteAccountPayableService } from '@/services/accounts-payable/delete-account-payable.service'
import { getAccountsPayableByIdService } from '@/services/accounts-payable/get-account-payable-by-id.service'
import { listAccountsPayableService } from '@/services/accounts-payable/list-accounts-payable.service'
import { updateAccountPayableService } from '@/services/accounts-payable/update-account-payable.service'
import { PaymentStatus } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'

class AccountsPayableController {
   constructor() {}

   public async getTotals(request: FastifyRequest, reply: FastifyReply) {
      try {
         const totals = await getTotalsAccountPayableService()
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
            supplierId: string
            documentNumber: string
            documentDate: string
            launchDate?: string
            dueDate: string
            paymentDate?: string
            value: number
            paidValue?: number
            discount?: number
            fine?: number
            interest?: number
            installmentNumber?: number
            totalInstallments?: number
            costCenterId?: string
            plannedPaymentMethod?: string
            paymentMethodId?: string
            observation?: string
            status?: PaymentStatus
         }
      }>,
      reply: FastifyReply,
   ) {
      const data = request.body
      const userId = request.user?.id

      if (!userId) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const validationError = await validateSchema(createAccountsPayableSchema, data, reply)
      if (validationError) return

      try {
         const accountPayable = await createAccountPayableService({ ...data, userId })
         return reply.status(201).send(accountPayable)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async list(
      request: FastifyRequest<{
         Querystring: {
            supplierId?: string
            costCenterId?: string
            status?: PaymentStatus
            paymentMethodId?: string
            dueDateStart?: string
            dueDateEnd?: string
            documentDateStart?: string
            documentDateEnd?: string
         }
      }>,
      reply: FastifyReply,
   ) {
      try {
         const { supplierId, costCenterId, status, paymentMethodId, dueDateStart, dueDateEnd, documentDateStart, documentDateEnd } = request.query

         const accounts = await listAccountsPayableService({
            supplierId,
            costCenterId,
            status,
            paymentMethodId,
            dueDateStart: dueDateStart ? new Date(dueDateStart) : undefined,
            dueDateEnd: dueDateEnd ? new Date(dueDateEnd) : undefined,
            documentDateStart: documentDateStart ? new Date(documentDateStart) : undefined,
            documentDateEnd: documentDateEnd ? new Date(documentDateEnd) : undefined,
         })

         return reply.status(200).send(accounts)
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
         Params: { id: string }
      }>,
      reply: FastifyReply,
   ) {
      const { id } = request.params
      try {
         const account = await getAccountsPayableByIdService(id)
         return reply.status(200).send(account)
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
         Params: { id: string }
         Body: Partial<{
            supplierId: string
            documentNumber?: string
            documentDate?: string
            launchDate?: string
            dueDate?: string
            paymentDate?: string
            value?: number
            paidValue?: number
            discount?: number
            fine?: number
            interest?: number
            installmentNumber?: number
            totalInstallments?: number
            costCenterId?: string
            plannedPaymentMethod?: string
            paymentMethodId?: string
            userId?: string
            observation?: string
            status?: PaymentStatus
         }>
      }>,
      reply: FastifyReply,
   ) {
      const { id } = request.params
      const data = request.body

      const validationError = await validateSchema(updateAccountsPayableSchema, data, reply)
      if (validationError) return

      try {
         const updated = await updateAccountPayableService(id, data)
         return reply.status(200).send(updated)
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
         Params: { id: string }
      }>,
      reply: FastifyReply,
   ) {
      const { id } = request.params
      try {
         await deleteAccountPayableService(id)
         return reply.status(204).send({ message: 'Conta a pagar removida com sucesso' })
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }
}

export default new AccountsPayableController()
