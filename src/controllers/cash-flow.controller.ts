import { AppError } from '@/helpers/app-error'
import { TransactionType } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { MultipartFile } from '@fastify/multipart'
import { validateSchema } from '@/helpers/validate-schema'
import { createCashFlowSchema, updateCostCenterCashFlowSchema } from '@/schemas/cash-flow'
import { createCashFlowService } from '@/services/cash-flow/create-cash-flow.service'
import { getCashFlowTotalsPerDayService } from '@/services/cash-flow/get-cash-flow-totals-per-day.service'
import { listCashFlowByAccountIdService } from '@/services/cash-flow/list-cash-flow-by-account-id.service'
import { listCashFlowByCashBoxIdService } from '@/services/cash-flow/list-cash-flow-by-cash-id.service'
import { parseBankTransactionsService } from '@/services/cash-flow/parse-bank-transactions.service'
import { processBankTransactionsService } from '@/services/cash-flow/process-bank-transactions.service'
import { linkReceivableToCashFlowService } from "@/services/cash-flow/link-receivable-to-cash-flow.service";
import { linkPayableToCashFlowService } from "@/services/cash-flow/link-payable-to-cash-flow.service";
import { unlinkReceivableFromCashFlowService } from "@/services/cash-flow/unlink-receivable-from-cash-flow.service";
import { unlinkPayableFromCashFlowService } from "@/services/cash-flow/unlink-payable-from-cash-flow.service";
import { updateCostCenterCashFlowService } from "@/services/cash-flow/update-cost-center-cash-flow.service";

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
            type: type as TransactionType,
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
      const { cashId } = request.params
      const { page = '1', limit = '10', type, description, history, costCenterId, dateStart, dateEnd, valueMin, valueMax } = request.query

      try {
         const cashFlowList = await listCashFlowByCashBoxIdService({
            page: parseInt(page),
            limit: parseInt(limit),
            type: type as TransactionType,
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

   public async parseXlsx(request: FastifyRequest, reply: FastifyReply) {
      const parts = request.parts()

      let sheetNumber: number | undefined = undefined
      let file: MultipartFile | null = null

      for await (const part of parts) {
         if (part.type === 'file') {
            file = part
         } else {
            if (part.fieldname === 'sheetNumber') {
               sheetNumber = Number(part.value)
            }
         }
      }

      if (!file) {
         return reply.status(400).send({ message: 'Nenhum arquivo foi enviado.' })
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

         const result = await parseBankTransactionsService({ sheetNumber, file: fileBuffer, filename })

         return reply.status(200).send(result)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         }
         console.error(error)
         return reply.status(500).send({ message: 'Erro interno do servidor ao analisar arquivo.' })
      }
   }

   public async processTransactions(
      request: FastifyRequest<{
         Body: {
            bankAccountId: string
            filename: string
            transactions: Array<{
               date: string
               historic: string
               value: number
               type: TransactionType
               detailing: string
               originalRow: number
               costCenterId?: string
            }>
         }
      }>,
      reply: FastifyReply,
   ) {
      const { bankAccountId, filename, transactions } = request.body

      if (!bankAccountId) {
         return reply.status(400).send({ message: 'ID da conta bancária não fornecido.' })
      }

      if (!filename) {
         return reply.status(400).send({ message: 'Nome do arquivo não fornecido.' })
      }

      if (!transactions || !Array.isArray(transactions)) {
         return reply.status(400).send({ message: 'Lista de transações não fornecida ou inválida.' })
      }

      try {
         const result = await processBankTransactionsService({ bankAccountId, filename, transactions })

         return reply.status(200).send({
            message: 'Importação realizada com sucesso!',
            ...result
         })
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         }
         console.error(error)
         return reply.status(500).send({ message: 'Erro interno do servidor ao processar transações.' })
      }
   }

   public async linkReceivable(
      request: FastifyRequest<{
         Params: { id: string };
         Body: {
            documentNumber: string;
         };
      }>,
      reply: FastifyReply,
   ) {
      const { id } = request.params;
      const { documentNumber } = request.body;
   
      if (!documentNumber) {
         return reply.status(400).send({ message: "Número do documento é obrigatório" });
      }
   
      try {
         const result = await linkReceivableToCashFlowService({
            cashFlowId: id,
            documentNumber,
         });
   
         return reply.status(200).send({
            message: "Lançamento vinculado com sucesso à conta a receber",
            data: result,
         });
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message });
         } else {
            return reply.status(500).send({ message: "Erro interno do servidor" });
         }
      }
   }

   public async linkPayable(
      request: FastifyRequest<{
         Params: { id: string };
         Body: {
            documentNumber: string;
         };
      }>,
      reply: FastifyReply,
   ) {
      const { id } = request.params;
      const { documentNumber } = request.body;
   
      if (!documentNumber) {
         return reply.status(400).send({ message: "Número do documento é obrigatório" });
      }
   
      try {
         const result = await linkPayableToCashFlowService({
            cashFlowId: id,
            documentNumber,
         });
   
         return reply.status(200).send({
            message: "Lançamento vinculado com sucesso à conta a pagar",
            data: result,
         });
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message });
         } else {
            return reply.status(500).send({ message: "Erro interno do servidor" });
         }
      }
   }

   public async unlinkReceivable(
      request: FastifyRequest<{
         Params: { id: string };
      }>,
      reply: FastifyReply,
   ) {
      const { id } = request.params;
   
      try {
         const result = await unlinkReceivableFromCashFlowService({
            cashFlowId: id,
         });
   
         return reply.status(200).send({
            message: "Lançamento desvinculado com sucesso da conta a receber",
            data: result,
         });
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message });
         } else {
            return reply.status(500).send({ message: "Erro interno do servidor" });
         }
      }
   }

   public async unlinkPayable(
      request: FastifyRequest<{
         Params: { id: string };
      }>,
      reply: FastifyReply,
   ) {
      const { id } = request.params;
   
      try {
         const result = await unlinkPayableFromCashFlowService({
            cashFlowId: id,
         });
   
         return reply.status(200).send({
            message: "Lançamento desvinculado com sucesso da conta a pagar",
            data: result,
         });
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message });
         } else {
            return reply.status(500).send({ message: "Erro interno do servidor" });
         }
      }
   }

   public async updateCostCenter(
      request: FastifyRequest<{
         Params: { id: string };
         Body: {
            costCenterId?: string;
         };
      }>,
      reply: FastifyReply,
   ) {
      const { id } = request.params;
      const data = request.body;

      const validationError = await validateSchema(updateCostCenterCashFlowSchema, data, reply);
      if (validationError) return;

      try {
         const updatedCashFlow = await updateCostCenterCashFlowService({
            cashFlowId: id,
            costCenterId: data.costCenterId,
         });

         return reply.status(200).send(updatedCashFlow);
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message });
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' });
         }
      }
   }
}

export default new CashFlowController()
