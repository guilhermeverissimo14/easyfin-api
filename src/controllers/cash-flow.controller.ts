import { AppError } from '@/helpers/app-error'
import { TransactionType } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { MultipartFile } from '@fastify/multipart'
import { validateSchema } from '@/helpers/validate-schema'
import { createCashFlowSchema } from '@/schemas/cash-flow'
import { createCashFlowService } from '@/services/cash-flow/create-cash-flow.service'
import { getCashFlowTotalsPerDayService } from '@/services/cash-flow/get-cash-flow-totals-per-day.service'
import { listCashFlowByAccountIdService } from '@/services/cash-flow/list-cash-flow-by-account-id.service'
import { listCashFlowByCashBoxIdService } from '@/services/cash-flow/list-cash-flow-by-cash-id.service'
import { importBankTransactionsService } from '@/services/cash-flow/import-bank-transactions.service'

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
         Querystring: {
            page?: string
            limit?: string
            type?: string
            description?: string
            history?: string
            costCenterId?: string
            dateStart?: string
            dateEnd?: string
            valueMin?: string
            valueMax?: string
         }
      }>,
      reply: FastifyReply,
   ) {
      const { bankAccountId } = request.params
      const { page = '1', limit = '10', type, description, history, costCenterId, dateStart, dateEnd, valueMin, valueMax } = request.query

      try {
         const cashFlowList = await listCashFlowByAccountIdService(bankAccountId, {
            page: parseInt(page),
            limit: parseInt(limit),
            type,
            description,
            history,
            costCenterId,
            dateStart: dateStart ? new Date(dateStart) : undefined,
            dateEnd: dateEnd ? new Date(dateEnd) : undefined,
            valueMin: valueMin ? parseFloat(valueMin) : undefined,
            valueMax: valueMax ? parseFloat(valueMax) : undefined,
         })
         return reply.status(200).send(cashFlowList)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async listByCash(
      request: FastifyRequest<{
         Params: { cashId: string }
         Querystring: {
            page?: string
            limit?: string
            type?: string
            description?: string
            history?: string
            costCenterId?: string
            dateStart?: string
            dateEnd?: string
            valueMin?: string
            valueMax?: string
         }
      }>,
      reply: FastifyReply,
   ) {
      const { page = '1', limit = '10', type, description, history, costCenterId, dateStart, dateEnd, valueMin, valueMax } = request.query

      try {
         const cashFlowList = await listCashFlowByCashBoxIdService({
            page: parseInt(page),
            limit: parseInt(limit),
            type,
            description,
            history,
            costCenterId,
            dateStart: dateStart ? new Date(dateStart) : undefined,
            dateEnd: dateEnd ? new Date(dateEnd) : undefined,
            valueMin: valueMin ? parseFloat(valueMin) : undefined,
            valueMax: valueMax ? parseFloat(valueMax) : undefined,
         })
         return reply.status(200).send(cashFlowList)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async importXlsx(request: FastifyRequest, reply: FastifyReply) {
      const parts = request.parts()

      let sheetNumber: number | undefined = undefined
      let bankAccountId: string | null = null
      let file: MultipartFile | null = null

      for await (const part of parts) {
         if (part.type === 'file') {
            file = part
         } else {
            if (part.fieldname === 'bankAccountId') {
               bankAccountId = part.value as string
            } else if (part.fieldname === 'sheetNumber') {
               sheetNumber = Number(part.value)
            }
         }
      }

      if (!file) {
         return reply.status(400).send({ message: 'Nenhum arquivo foi enviado.' })
      }

      if (!bankAccountId) {
         return reply.status(400).send({ message: 'ID da conta bancária não fornecido.' })
      }

      if (sheetNumber !== undefined && (isNaN(sheetNumber) || sheetNumber < 0)) {
         return reply.status(400).send({ message: 'Número da planilha inválido.' })
      }

      try {
         const filename = file.filename
         const fileBuffer = await file.toBuffer()

         if (!filename.endsWith('.xlsx')) {
            return reply.status(400).send({ message: 'Apenas arquivos .xlsx são permitidos.' })
         }

         await importBankTransactionsService({ sheetNumber, bankAccountId, file: fileBuffer, filename })

         return reply.status(200).send({ message: 'Importação realizada com sucesso!' })
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         }
         console.error(error)
         return reply.status(500).send({ message: 'Erro interno do servidor ao importar transações bancárias.' })
      }
   }
}

export default new CashFlowController()
