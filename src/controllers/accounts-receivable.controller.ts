import { AppError } from '@/helpers/app-error'
import { validateSchema } from '@/helpers/validate-schema'
import { createAccountsReceivableSchema, updateAccountsReceivableSchema } from '@/schemas/accounts-receivable'
import { getTotalsAccountReceivableService } from '@/services/accounts-receivable/get-totals-account-receivable.service'
import { createAccountReceivableService } from '@/services/accounts-receivable/create-account-receivable.service'
import { deleteAccountReceivableService } from '@/services/accounts-receivable/delete-account-receivable.service'
import { getAccountsReceivableByIdService } from '@/services/accounts-receivable/get-account-receivable-by-id.service'
import { listAccountsReceivableService } from '@/services/accounts-receivable/list-accounts-receivable.service'
import { updateAccountReceivableService } from '@/services/accounts-receivable/update-account-receivable.service'
import { PaymentStatus } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { receiveAccountReceivableService } from '@/services/accounts-receivable/receive-account-receivable.service'
import { reverseAccountReceivableService } from '@/services/accounts-receivable/reverse-account-receivable.service'
import { listPendingAccountsReceivableService } from '@/services/accounts-receivable/list-pending-accounts-receivable.service'

class AccountsReceivableController {
   constructor() {}

   public async getTotals(request: FastifyRequest, reply: FastifyReply) {
      try {
         const totals = await getTotalsAccountReceivableService()
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
            customerId: string
            documentNumber: string
            documentDate: string
            launchDate?: string
            dueDate: string
            receiptDate?: string
            value: number
            receivedValue?: number
            discount?: number
            fine?: number
            interest?: number
            installmentNumber?: number
            totalInstallments?: number
            costCenterId?: string
            bankAccountId?: string
            plannedPaymentMethod?: string
            paymentMethodId?: string
            observation?: string
            status?: PaymentStatus
            hasCashFlow?: boolean
         }
      }>,
      reply: FastifyReply,
   ) {
      const data = request.body
      const userId = request.user?.id

      if (!userId) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const validationError = await validateSchema(createAccountsReceivableSchema, data, reply)
      if (validationError) return

      try {
         const accountReceivable = await createAccountReceivableService({
            ...data,
            userId,
         })
         return reply.status(201).send(accountReceivable)
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
            customerId?: string
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
         const { customerId, costCenterId, status, paymentMethodId, dueDateStart, dueDateEnd, documentDateStart, documentDateEnd } = request.query

         const accounts = await listAccountsReceivableService({
            customerId,
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
         const account = await getAccountsReceivableByIdService(id)
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
            customerId: string
            documentNumber?: string
            documentDate?: string
            launchDate?: string
            dueDate?: string
            receiptDate?: string
            value?: number
            receivedValue?: number
            discount?: number
            fine?: number
            interest?: number
            installmentNumber?: number
            totalInstallments?: number
            costCenterId?: string
            bankAccountId?: string
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

      const validationError = await validateSchema(updateAccountsReceivableSchema, data, reply)
      if (validationError) return

      try {
         const updated = await updateAccountReceivableService(id, data)
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
         await deleteAccountReceivableService(id)
         return reply.status(204).send({ message: 'Conta a receber removida com sucesso' })
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async receive(
      request: FastifyRequest<{
         Params: { id: string }
         Body: {
            fine?: number
            interest?: number
            discount?: number
            observation?: string
            paymentMethodId?: string
            receiptDate?: string
            costCenterId?: string
            bankAccountId?: string
            generateCashFlow?: boolean
         }
      }>,
      reply: FastifyReply,
   ) {
      try {
         const { id } = request.params
         const {
            fine,
            interest,
            discount,
            observation,
            paymentMethodId,
            receiptDate,
            costCenterId,
            bankAccountId,
            generateCashFlow = true, // Padrão true para manter compatibilidade
         } = request.body

         const receivedAccount = await receiveAccountReceivableService(id, {
            fine,
            interest,
            discount,
            observation,
            paymentMethodId,
            receiptDate: receiptDate ? new Date(receiptDate) : undefined,
            costCenterId,
            bankAccountId,
            generateCashFlow,
         })

         return reply.status(200).send(receivedAccount)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async reverseReceive(
      request: FastifyRequest<{
         Params: { id: string }
         Body: {
            reason?: string
         }
      }>,
      reply: FastifyReply,
   ) {
      try {
         const { id } = request.params
         const { reason } = request.body

         const reversedAccount = await reverseAccountReceivableService(id, reason)

         return reply.status(200).send({
            message: 'Conta a receber estornada com sucesso',
            account: reversedAccount,
         })
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async listPending(request: FastifyRequest, reply: FastifyReply) {
      try {
         const accounts = await listPendingAccountsReceivableService()
         return reply.status(200).send(accounts)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }
}

export default new AccountsReceivableController()
