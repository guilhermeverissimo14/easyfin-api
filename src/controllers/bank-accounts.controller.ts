import { AppError } from '@/helpers/app-error'
import { validateSchema } from '@/helpers/validate-schema'
import { createBankAccountSchema, updateBankAccountSchema } from '@/schemas/bank-account'
import { createPaymentTermSchema } from '@/schemas/payment-term'
import { createBankAccountService } from '@/services/bank-account/create-bank-account.service'
import { deleteBankAccountService } from '@/services/bank-account/delete-bank-account.service'
import { getBankAccountByIdService } from '@/services/bank-account/get-bank-account-by-id.service'
import { listBankAccountsService } from '@/services/bank-account/list-bank-account.service'
import { updateBankAccountService } from '@/services/bank-account/update-bank-account.service'
import { createPaymentTermService } from '@/services/payment-term/create-payment-term.service'
import { deletePaymentTermService } from '@/services/payment-term/delete-payment-term.service'
import { getPaymentTermByIdService } from '@/services/payment-term/get-payment-term-by-id.service'
import { listPaymentTermsService } from '@/services/payment-term/list-payment-term.service'
import { updatePaymentTermService } from '@/services/payment-term/update-payment-term.service'
import { FastifyReply, FastifyRequest } from 'fastify'

class BankAccountsController {
   constructor() {}

   public async create(
      request: FastifyRequest<{
         Body: {
            bank: string
            agency: string
            account: string
            type: string
         }
      }>,
      reply: FastifyReply,
   ) {
      const { bank, agency, account, type } = request.body
      const userId = request.user?.id
      const userRole = request.user?.role

      if (!userId || !userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const validationError = await validateSchema(createBankAccountSchema, { bank, agency, account, type }, reply)

      console.log('validationError', validationError)

      if (validationError || !['C', 'P'].includes(type)) {
         return
      }

      try {
         const bankAccount = await createBankAccountService({
            bank,
            agency,
            account,
            type,
         })

         return reply.status(201).send(bankAccount)
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
         const bankAccounts = await listBankAccountsService()
         return reply.status(200).send(bankAccounts)
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
         const bankAccount = await getBankAccountByIdService(id)
         return reply.status(200).send(bankAccount)
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
            bank?: string
            agency?: string
            account?: string
            type?: string
         }
      }>,
      reply: FastifyReply,
   ) {
      const { id } = request.params
      const { bank, agency, account, type } = request.body
      const userRole = request.user?.role

      const allowedTypes = ['C', 'P'] as const
      const safeType = allowedTypes.includes(type as any) ? (type as 'C' | 'P') : undefined

      if (!userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const validationError = await validateSchema(updateBankAccountSchema, { bank, agency, account, type: safeType }, reply)

      if (validationError) {
         return
      }

      try {
         const updatedBankAccount = await updateBankAccountService(id, { bank, agency, account, type })
         return reply.status(200).send(updatedBankAccount)
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
         await deleteBankAccountService(id, userRole)
         return reply.status(204).send({ message: 'Conta bancária removida com sucesso' })
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }
}

export default new BankAccountsController()
